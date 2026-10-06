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
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { BuscarInstitucionesUseCase } from '../../../../../../../application/use-cases/meritos/buscar-instituciones.use-case';
import { CatalogoItem } from '../../../../../../../domain/models/catalogo-item.model';
import {
  EstudioOfimatica,
  idNivelOfimaticaBasico,
  LIMITE_NOMBRE_CURSO_OFIMATICA,
  NivelOfimaticaCatalogo,
  TOPE_PUNTAJE_OFIMATICA,
} from '../../../../../../../domain/models/rubro-ofimatica.model';
import { aDateDesdeIso, aFechaIsoLocal, nuevoIdLocal } from '../../rubros.util';

export interface FormularioOfimaticaData {
  niveles: NivelOfimaticaCatalogo[];
  tiposDocumento: CatalogoItem[];
  paises: CatalogoItem[];
  estudio?: EstudioOfimatica | null;
}

export type EstudioOfimaticaGuardado = Omit<EstudioOfimatica, 'id' | 'puntaje'> & {
  id?: string;
  puntaje: number;
};

@Component({
  selector: 'app-formulario-ofimatica',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }],
  templateUrl: './formulario-ofimatica.html',
  styleUrl: './formulario-ofimatica.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioOfimatica implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioOfimatica>);
  private readonly data = inject<FormularioOfimaticaData>(MAT_DIALOG_DATA);
  private readonly buscarInstituciones = inject(BuscarInstitucionesUseCase);

  readonly guardar = output<EstudioOfimaticaGuardado>();

  protected readonly niveles = this.data.niveles;
  protected readonly tiposDocumento = this.data.tiposDocumento;
  protected readonly paises = this.data.paises;
  protected readonly limiteCurso = LIMITE_NOMBRE_CURSO_OFIMATICA;
  protected readonly tope = TOPE_PUNTAJE_OFIMATICA;
  protected readonly institucionesFiltradas = signal<CatalogoItem[]>([]);
  private readonly idBasico = idNivelOfimaticaBasico(this.data.niveles);

  protected readonly formulario = this.fb.group({
    nombreCurso: this.fb.nonNullable.control(this.data.estudio?.nombreCurso ?? '', [
      Validators.required,
      Validators.maxLength(LIMITE_NOMBRE_CURSO_OFIMATICA),
    ]),
    paisId: this.fb.nonNullable.control(this.data.estudio?.paisId ?? '', Validators.required),
    institucionBusqueda: this.fb.nonNullable.control(
      this.data.estudio?.institucionNombre ?? '',
      Validators.required
    ),
    institucionId: this.fb.nonNullable.control(
      this.data.estudio?.institucionId ?? '',
      Validators.required
    ),
    duracionHoras: this.fb.control<number | null>(this.data.estudio?.duracionHoras ?? null, [
      Validators.required,
      horasEnterasPositivas,
    ]),
    sinNivel: this.fb.nonNullable.control(!this.data.estudio),
    nivelOfimaticaId: this.fb.nonNullable.control(
      this.data.estudio?.nivelOfimaticaId ?? this.idBasico,
      Validators.required
    ),
    tipoDocumentoId: this.fb.nonNullable.control(
      this.data.estudio?.tipoDocumentoId ?? '',
      Validators.required
    ),
    fechaObtencion: this.fb.control<Date | null>(
      aDateDesdeIso(this.data.estudio?.fechaObtencion),
      Validators.required
    ),
  });

  ngOnInit(): void {
    this.escucharBusquedaInstitucion();
    this.escucharCambioPais();
    this.escucharSinNivel();
    this.aplicarSinNivel(this.formulario.controls.sinNivel.value);
  }

  protected onCerrar(): void {
    this.dialogRef.close();
  }

  protected onSeleccionarInstitucion(nombre: string): void {
    const institucion = this.institucionesFiltradas().find((item) => item.nombre === nombre);
    if (!institucion) {
      return;
    }
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
    const nivelId = raw.sinNivel ? this.idBasico : raw.nivelOfimaticaId;
    if (!raw.fechaObtencion || !raw.institucionId || !nivelId || raw.duracionHoras == null) {
      return;
    }

    const nivel = this.niveles.find((item) => item.id === nivelId);
    const tipoDocumento = this.tiposDocumento.find((item) => item.id === raw.tipoDocumentoId);
    const pais = this.paises.find((item) => item.id === raw.paisId);

    this.guardar.emit({
      id: this.data.estudio?.id ?? nuevoIdLocal('ofimatica'),
      nombreCurso: raw.nombreCurso.trim(),
      institucionId: raw.institucionId,
      institucionNombre: raw.institucionBusqueda.trim(),
      paisId: raw.paisId,
      nombrePais: pais?.nombre ?? this.data.estudio?.nombrePais ?? '',
      duracionHoras: raw.duracionHoras,
      nivelOfimaticaId: nivelId,
      nivelOfimaticaCodigo: nivel?.codigo ?? this.data.estudio?.nivelOfimaticaCodigo ?? '',
      nivelOfimaticaDescripcion:
        nivel?.descripcion ?? this.data.estudio?.nivelOfimaticaDescripcion ?? '',
      tipoDocumentoId: raw.tipoDocumentoId,
      tipoDocumentoDescripcion:
        tipoDocumento?.nombre ?? this.data.estudio?.tipoDocumentoDescripcion ?? '',
      fechaObtencion: aFechaIsoLocal(raw.fechaObtencion),
      archivoId: this.data.estudio?.archivoId ?? null,
      puntaje: this.data.estudio?.puntaje ?? 0,
    });
  }

  private escucharSinNivel(): void {
    this.formulario.controls.sinNivel.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((marcado) => this.aplicarSinNivel(marcado));
  }

  private aplicarSinNivel(marcado: boolean): void {
    const nivel = this.formulario.controls.nivelOfimaticaId;
    if (marcado && this.idBasico) {
      nivel.setValue(this.idBasico);
      nivel.disable({ emitEvent: false });
      return;
    }
    nivel.enable({ emitEvent: false });
  }

  private escucharCambioPais(): void {
    this.formulario.controls.paisId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.formulario.patchValue({
          institucionBusqueda: '',
          institucionId: '',
        });
        this.institucionesFiltradas.set([]);
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
          if (termino.length < 2 || termino.length > 100) {
            return of<CatalogoItem[]>([]);
          }
          const paisId = this.formulario.controls.paisId.value?.trim() ?? '';
          return this.buscarInstituciones
            .ejecutar(termino, paisId || undefined, 20)
            .pipe(map((resultado) => (resultado.exito ? resultado.instituciones : [])));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((filtradas) => this.institucionesFiltradas.set(filtradas));

    this.formulario.controls.institucionBusqueda.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valor) => {
        const texto = valor?.trim() ?? '';
        const actual = this.institucionesFiltradas().find((item) => item.nombre === texto);
        if (!actual && this.formulario.controls.institucionId.value) {
          const previo = this.data.estudio;
          if (!previo || texto !== previo.institucionNombre) {
            this.formulario.controls.institucionId.setValue('');
          }
        }
      });
  }
}

function horasEnterasPositivas(control: AbstractControl): ValidationErrors | null {
  const valor = Number(control.value);
  if (!Number.isInteger(valor) || valor <= 0) {
    return { horas: true };
  }
  return null;
}
