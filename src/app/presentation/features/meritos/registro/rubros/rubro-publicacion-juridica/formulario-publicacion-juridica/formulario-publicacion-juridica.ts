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
import { BuscarInstitucionesIdiomaUseCase } from '../../../../../../../application/use-cases/meritos/buscar-instituciones-idioma.use-case';
import { CatalogoItem } from '../../../../../../../domain/models/catalogo-item.model';
import {
  OPCIONES_ORDEN_JURIDICO,
  OPCIONES_PREMIADA,
  OrdenJuridico,
  PublicacionJuridica,
} from '../../../../../../../domain/models/rubro-publicacion-juridica.model';
import {
  aDateDesdeIso,
  aFechaIsoLocal,
  esIdPersistidoApi,
  nuevoIdLocal,
} from '../../rubros.util';

export interface FormularioPublicacionJuridicaData {
  tiposPublicacion: CatalogoItem[];
  paises: CatalogoItem[];
  publicacion?: PublicacionJuridica | null;
}

export type PublicacionJuridicaGuardada = Omit<PublicacionJuridica, 'id'> & { id?: string };

@Component({
  selector: 'app-formulario-publicacion-juridica',
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
  templateUrl: './formulario-publicacion-juridica.html',
  styleUrl: './formulario-publicacion-juridica.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioPublicacionJuridica implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioPublicacionJuridica>);
  private readonly data = inject<FormularioPublicacionJuridicaData>(MAT_DIALOG_DATA);
  private readonly buscarInstituciones = inject(BuscarInstitucionesIdiomaUseCase);

  readonly guardar = output<PublicacionJuridicaGuardada>();

  protected readonly tiposPublicacion = this.data.tiposPublicacion;
  protected readonly paises = this.data.paises;
  protected readonly opcionesOrdenJuridico = OPCIONES_ORDEN_JURIDICO;
  protected readonly opcionesPremiada = OPCIONES_PREMIADA;
  protected readonly esActualizacion = esIdPersistidoApi(this.data.publicacion?.id);
  protected readonly institucionesFiltradas = signal<CatalogoItem[]>([]);
  protected readonly buscandoInstituciones = signal(false);

  protected readonly formulario = this.fb.group({
    tipoPublicacionId: this.fb.nonNullable.control(
      this.data.publicacion?.tipoPublicacionId ?? '',
      Validators.required
    ),
    titulo: this.fb.nonNullable.control(this.data.publicacion?.titulo ?? '', Validators.required),
    editorial: this.fb.nonNullable.control(
      this.data.publicacion?.editorial ?? '',
      Validators.required
    ),
    paginas: this.fb.nonNullable.control(this.data.publicacion?.paginas ?? 1, [
      Validators.required,
      Validators.min(1),
    ]),
    numEdicion: this.fb.nonNullable.control(
      this.data.publicacion?.numEdicion ?? '',
      Validators.required
    ),
    auspicio: this.fb.nonNullable.control(this.data.publicacion?.auspicio ?? ''),
    paisId: this.fb.nonNullable.control(this.data.publicacion?.paisId ?? '', Validators.required),
    ordenJuridico: this.fb.nonNullable.control<OrdenJuridico>(
      this.data.publicacion?.ordenJuridico ?? 'JURIDICO',
      Validators.required
    ),
    especialidad: this.fb.nonNullable.control(this.data.publicacion?.especialidad ?? ''),
    institucionBusqueda: this.fb.nonNullable.control(
      this.data.publicacion?.institucionNombre ?? ''
    ),
    institucionId: this.fb.nonNullable.control(this.data.publicacion?.institucionId ?? ''),
    fechaPublicacion: this.fb.control<Date | null>(
      aDateDesdeIso(this.data.publicacion?.fechaPublicacion),
      Validators.required
    ),
    premiada: this.fb.nonNullable.control<boolean>(
      this.data.publicacion?.premiada ?? false,
      Validators.required
    ),
  });

  ngOnInit(): void {
    this.escucharBusquedaInstitucion();
  }

  protected onCerrar(): void {
    this.dialogRef.close();
  }

  protected onSeleccionarInstitucion(institucion: CatalogoItem): void {
    this.formulario.patchValue({
      institucionBusqueda: institucion.nombre,
      institucionId: institucion.id,
    });
  }

  protected onGuardar(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      return;
    }

    const raw = this.formulario.getRawValue();
    const tipo = this.tiposPublicacion.find((item) => item.id === raw.tipoPublicacionId);
    const pais = this.paises.find((item) => item.id === raw.paisId);
    const fecha = raw.fechaPublicacion ? aFechaIsoLocal(raw.fechaPublicacion) : '';

    if (!tipo || !pais || !fecha) {
      return;
    }

    this.guardar.emit({
      id: this.data.publicacion?.id ?? nuevoIdLocal('pub-jur'),
      tipoPublicacionId: tipo.id,
      tipoPublicacionNombre: tipo.nombre,
      titulo: raw.titulo.trim(),
      editorial: raw.editorial.trim(),
      paginas: Number(raw.paginas),
      numEdicion: raw.numEdicion.trim(),
      auspicio: raw.auspicio.trim(),
      paisId: pais.id,
      paisNombre: pais.nombre,
      ordenJuridico: raw.ordenJuridico,
      especialidad: raw.especialidad.trim(),
      institucionId: raw.institucionId.trim(),
      institucionNombre: raw.institucionBusqueda.trim(),
      fechaPublicacion: fecha,
      premiada: raw.premiada,
      archivoId: this.data.publicacion?.archivoId ?? null,
      puntaje: this.data.publicacion?.puntaje ?? 0,
    });
  }

  private escucharBusquedaInstitucion(): void {
    this.formulario.controls.institucionBusqueda.valueChanges
      .pipe(
        startWith(this.formulario.controls.institucionBusqueda.value),
        debounceTime(300),
        map((valor) => valor?.trim() ?? ''),
        distinctUntilChanged(),
        switchMap((termino) => {
          if (termino.length < 2) {
            this.buscandoInstituciones.set(false);
            return of<CatalogoItem[]>([]);
          }

          this.buscandoInstituciones.set(true);
          return this.buscarInstituciones
            .ejecutar(termino)
            .pipe(map((resultado) => (resultado.exito ? resultado.instituciones : [])));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((filtradas) => {
        this.buscandoInstituciones.set(false);
        this.institucionesFiltradas.set(filtradas);
      });

    this.formulario.controls.institucionBusqueda.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valor) => {
        const texto = valor?.trim() ?? '';
        const actual = this.institucionesFiltradas().find((item) => item.nombre === texto);
        if (!actual) {
          this.formulario.controls.institucionId.setValue('', { emitEvent: false });
          return;
        }
        if (this.formulario.controls.institucionId.value !== actual.id) {
          this.formulario.controls.institucionId.setValue(actual.id, { emitEvent: false });
        }
      });
  }
}
