import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { BuscarUniversidadesUseCase } from '../../../../../../../application/use-cases/meritos/buscar-universidades.use-case';
import { CatalogoItem } from '../../../../../../../domain/models/catalogo-item.model';
import {
  ESPECIALIDAD_NO_JURIDICA,
  ESPECIALIDADES_GRADO_TITULO,
  esTituloProfesional,
  etiquetaEspecialidadGrado,
  GradoTitulo,
} from '../../../../../../../domain/models/rubro-grados-titulos.model';
import {
  aDateDesdeIso,
  aFechaIsoLocal,
  esIdPersistidoApi,
  nuevoIdLocal,
} from '../../rubros.util';

export interface FormularioGradoTituloData {
  nivelesGrado: CatalogoItem[];
  paises: CatalogoItem[];
  gradoTitulo?: GradoTitulo | null;
}

export type GradoTituloGuardado = Omit<GradoTitulo, 'id'> & { id?: string };

@Component({
  selector: 'app-formulario-grado-titulo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatAutocompleteModule,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
  ],
  templateUrl: './formulario-grado-titulo.html',
  styleUrl: './formulario-grado-titulo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioGradoTitulo implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioGradoTitulo>);
  private readonly data = inject<FormularioGradoTituloData>(MAT_DIALOG_DATA);
  private readonly buscarUniversidades = inject(BuscarUniversidadesUseCase);

  readonly guardar = output<GradoTituloGuardado>();

  protected readonly nivelesGrado = this.data.nivelesGrado;
  protected readonly paises = this.data.paises;
  protected readonly especialidades = ESPECIALIDADES_GRADO_TITULO;
  protected readonly etiquetaEspecialidad = etiquetaEspecialidadGrado;
  protected readonly esEdicion = !!this.data.gradoTitulo;
  protected readonly esActualizacion = esIdPersistidoApi(this.data.gradoTitulo?.id);
  protected readonly universidadesFiltradas = signal<CatalogoItem[]>([]);
  protected readonly buscandoUniversidades = signal(false);
  protected readonly soloEspecialidadNoJuridica = signal(false);

  protected readonly formulario = this.fb.group({
    gradoAcademicoId: this.fb.nonNullable.control(
      this.data.gradoTitulo?.gradoAcademicoId ?? '',
      Validators.required
    ),
    universidadBusqueda: this.fb.nonNullable.control(
      this.data.gradoTitulo?.universidadNombre ?? '',
      Validators.required
    ),
    universidadId: this.fb.nonNullable.control(
      this.data.gradoTitulo?.universidadId ?? '',
      Validators.required
    ),
    paisId: this.fb.nonNullable.control(
      this.data.gradoTitulo?.paisId ?? this.paisPorDefecto(),
      Validators.required
    ),
    fechaObtencion: this.fb.control<Date | null>(
      aDateDesdeIso(this.data.gradoTitulo?.fechaObtencion),
      Validators.required
    ),
    especialidad: this.fb.nonNullable.control(
      this.data.gradoTitulo?.especialidad ?? '',
      Validators.required
    ),
    mencion: this.fb.nonNullable.control(
      this.data.gradoTitulo?.mencion ?? '',
      Validators.required
    ),
    observacion: this.fb.nonNullable.control(this.data.gradoTitulo?.observacion ?? ''),
  });

  ngOnInit(): void {
    this.aplicarReglasTituloProfesional(this.formulario.controls.gradoAcademicoId.value);
    this.actualizarEstadoBusquedaUniversidad(this.formulario.controls.paisId.value);
    this.escucharCambioGrado();
    this.escucharBusquedaUniversidad();
    this.escucharCambioPais();
  }

  protected onCerrar(): void {
    this.dialogRef.close();
  }

  protected onSeleccionarUniversidad(universidad: CatalogoItem): void {
    this.formulario.patchValue({
      universidadBusqueda: universidad.nombre,
      universidadId: universidad.id,
    });
  }

  protected onGuardar(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      return;
    }

    const raw = this.formulario.getRawValue();
    const nivel = this.nivelesGrado.find((item) => item.id === raw.gradoAcademicoId);
    const pais = this.paises.find((item) => item.id === raw.paisId);

    if (!raw.fechaObtencion || !nivel || !raw.universidadId) {
      return;
    }

    this.guardar.emit({
      id: this.data.gradoTitulo?.id ?? nuevoIdLocal('grado'),
      gradoAcademicoId: nivel.id,
      gradoAcademicoNombre: nivel.nombre,
      universidadId: raw.universidadId,
      universidadNombre: raw.universidadBusqueda.trim(),
      paisId: raw.paisId,
      paisNombre: pais?.nombre ?? this.data.gradoTitulo?.paisNombre ?? '',
      fechaObtencion: aFechaIsoLocal(raw.fechaObtencion),
      especialidad: raw.especialidad.trim(),
      mencion: raw.mencion.trim(),
      observacion: raw.observacion.trim(),
      puntaje: this.data.gradoTitulo?.puntaje ?? 0,
    });
  }

  private escucharCambioGrado(): void {
    this.formulario.controls.gradoAcademicoId.valueChanges
      .pipe(startWith(this.formulario.controls.gradoAcademicoId.value), takeUntilDestroyed(this.destroyRef))
      .subscribe((gradoId) => this.aplicarReglasTituloProfesional(gradoId));
  }

  private aplicarReglasTituloProfesional(gradoId: string): void {
    const nivel = this.nivelesGrado.find((item) => item.id === gradoId);
    const esProfesional = nivel ? esTituloProfesional(nivel.nombre) : false;
    this.soloEspecialidadNoJuridica.set(esProfesional);

    if (esProfesional) {
      this.formulario.controls.especialidad.setValue(ESPECIALIDAD_NO_JURIDICA);
      return;
    }

    const actual = this.formulario.controls.especialidad.value;
    if (actual === ESPECIALIDAD_NO_JURIDICA && !this.data.gradoTitulo?.especialidad) {
      this.formulario.controls.especialidad.setValue('');
    }
  }

  private escucharCambioPais(): void {
    this.formulario.controls.paisId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((paisId) => {
        this.actualizarEstadoBusquedaUniversidad(paisId);
        this.formulario.patchValue({
          universidadBusqueda: '',
          universidadId: '',
        });
        this.universidadesFiltradas.set([]);
      });
  }

  private actualizarEstadoBusquedaUniversidad(paisId: string): void {
    const control = this.formulario.controls.universidadBusqueda;
    if (paisId?.trim()) {
      control.enable({ emitEvent: false });
      return;
    }

    control.disable({ emitEvent: false });
  }

  private escucharBusquedaUniversidad(): void {
    this.formulario.controls.universidadBusqueda.valueChanges
      .pipe(
        startWith(this.formulario.controls.universidadBusqueda.value),
        debounceTime(300),
        map((valor) => valor?.trim() ?? ''),
        distinctUntilChanged(),
        switchMap((termino) => {
          const paisId = this.formulario.controls.paisId.value?.trim() ?? '';
          if (!paisId || termino.length < 2) {
            this.buscandoUniversidades.set(false);
            return of<CatalogoItem[]>([]);
          }

          this.buscandoUniversidades.set(true);
          return this.buscarUniversidades
            .ejecutar(termino, paisId, 20)
            .pipe(map((resultado) => (resultado.exito ? resultado.universidades : [])));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((filtradas) => {
        this.buscandoUniversidades.set(false);
        this.universidadesFiltradas.set(filtradas);
      });

    this.formulario.controls.universidadBusqueda.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valor) => {
        const texto = valor?.trim() ?? '';
        const actual = this.universidadesFiltradas().find((item) => item.nombre === texto);
        if (!actual) {
          this.formulario.controls.universidadId.setValue('', { emitEvent: false });
          return;
        }
        if (this.formulario.controls.universidadId.value !== actual.id) {
          this.formulario.controls.universidadId.setValue(actual.id, { emitEvent: false });
        }
      });
  }

  private paisPorDefecto(): string {
    const peru = this.data.paises.find((pais) => {
      const nombre = pais.nombre.trim().toLowerCase();
      return nombre === 'perú' || nombre === 'peru';
    });
    return peru?.id ?? this.data.paises[0]?.id ?? '';
  }
}
