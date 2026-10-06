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
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
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
  CursoEspecializacion,
  JuridicoCurso,
  LIMITE_NOMBRE_CURSO,
  OPCIONES_JURIDICO_CURSO,
  TipoCursoEspecializacionCatalogo,
  TOPE_PUNTAJE_CURSOS_ESPECIALIZACION,
  TrasladoEventoCurso,
} from '../../../../../../../domain/models/rubro-cursos-especializacion.model';
import {
  aDateDesdeIso,
  aFechaIsoLocal,
  crearFiltroFechaMinima,
  esFechaAnterior,
  nuevoIdLocal,
} from '../../rubros.util';

export interface FormularioCursoEspecializacionData {
  tipos: TipoCursoEspecializacionCatalogo[];
  paises: CatalogoItem[];
  especialidades: CatalogoItem[];
  curso?: CursoEspecializacion | null;
}

export type CursoEspecializacionGuardado = Omit<CursoEspecializacion, 'id' | 'puntaje' | 'trasladoEvento'> & {
  id?: string;
  puntaje: number;
  trasladoEvento: TrasladoEventoCurso;
};

@Component({
  selector: 'app-formulario-curso-especializacion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }],
  templateUrl: './formulario-curso-especializacion.html',
  styleUrl: './formulario-curso-especializacion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioCursoEspecializacion implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioCursoEspecializacion>);
  private readonly data = inject<FormularioCursoEspecializacionData>(MAT_DIALOG_DATA);
  private readonly buscarInstituciones = inject(BuscarInstitucionesUseCase);

  readonly guardar = output<CursoEspecializacionGuardado>();

  protected readonly tipos = this.data.tipos;
  protected readonly paises = this.data.paises;
  protected readonly especialidades = this.data.especialidades;
  protected readonly opcionesJuridico = OPCIONES_JURIDICO_CURSO;
  protected readonly limiteNombre = LIMITE_NOMBRE_CURSO;
  protected readonly tope = TOPE_PUNTAJE_CURSOS_ESPECIALIZACION;
  protected readonly institucionesFiltradas = signal<CatalogoItem[]>([]);
  protected readonly horasMenoresACincuenta = signal(false);
  protected readonly filtroFechaFin = crearFiltroFechaMinima(
    () => this.formulario.controls.fechaInicio.value
  );

  protected readonly formulario = this.fb.group(
    {
      tipoCursoEspecializacionId: this.fb.nonNullable.control(
        this.data.curso?.tipoCursoEspecializacionId ?? '',
        Validators.required
      ),
      nombreCurso: this.fb.nonNullable.control(this.data.curso?.nombreCurso ?? '', [
        Validators.required,
        Validators.maxLength(LIMITE_NOMBRE_CURSO),
      ]),
      paisId: this.fb.nonNullable.control(this.data.curso?.paisId ?? '', Validators.required),
      institucionBusqueda: this.fb.nonNullable.control(
        this.data.curso?.institucionNombre ?? '',
        Validators.required
      ),
      institucionId: this.fb.nonNullable.control(
        this.data.curso?.institucionId ?? '',
        Validators.required
      ),
      fechaInicio: this.fb.control<Date | null>(
        aDateDesdeIso(this.data.curso?.fechaInicio),
        Validators.required
      ),
      fechaFin: this.fb.control<Date | null>(
        aDateDesdeIso(this.data.curso?.fechaFin),
        Validators.required
      ),
      juridico: this.fb.nonNullable.control<JuridicoCurso | ''>(
        this.data.curso?.juridico ?? '',
        Validators.required
      ),
      especialidadId: this.fb.nonNullable.control(
        this.data.curso?.especialidadId ?? '',
        Validators.required
      ),
      tiempoHoras: this.fb.control<number | null>(this.data.curso?.tiempoHoras ?? null, [
        Validators.required,
        horasEnterasPositivas,
      ]),
    },
    { validators: fechasCursoCoherentes }
  );

  ngOnInit(): void {
    this.actualizarAvisoHoras(this.formulario.controls.tiempoHoras.value);
    this.escucharHoras();
    this.escucharBusquedaInstitucion();
    this.escucharCambioPais();
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
    const horas = Number(raw.tiempoHoras);
    if (
      !raw.fechaInicio ||
      !raw.fechaFin ||
      !raw.institucionId ||
      (raw.juridico !== '1' && raw.juridico !== '0') ||
      !Number.isInteger(horas) ||
      horas <= 0
    ) {
      return;
    }

    const tipo = this.tipos.find((item) => item.id === raw.tipoCursoEspecializacionId);
    const pais = this.paises.find((item) => item.id === raw.paisId);
    const especialidad = this.especialidades.find((item) => item.id === raw.especialidadId);

    this.guardar.emit({
      id: this.data.curso?.id ?? nuevoIdLocal('curso'),
      tipoCursoEspecializacionId: raw.tipoCursoEspecializacionId,
      tipoCursoEspecializacionDescripcion:
        tipo?.descripcion ?? this.data.curso?.tipoCursoEspecializacionDescripcion ?? '',
      nombreCurso: raw.nombreCurso.trim(),
      institucionId: raw.institucionId,
      institucionNombre: raw.institucionBusqueda.trim(),
      paisId: raw.paisId,
      nombrePais: pais?.nombre ?? this.data.curso?.nombrePais ?? '',
      fechaInicio: aFechaIsoLocal(raw.fechaInicio),
      fechaFin: aFechaIsoLocal(raw.fechaFin),
      juridico: raw.juridico,
      especialidadId: raw.especialidadId,
      especialidadDescripcion:
        especialidad?.nombre ?? this.data.curso?.especialidadDescripcion ?? '',
      tiempoHoras: horas,
      archivoId: this.data.curso?.archivoId ?? null,
      puntaje: this.data.curso?.puntaje ?? 0,
      trasladoEvento: this.data.curso?.trasladoEvento ?? '0',
    });
  }

  private escucharHoras(): void {
    this.formulario.controls.tiempoHoras.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valor) => this.actualizarAvisoHoras(valor));
  }

  private actualizarAvisoHoras(valor: number | null): void {
    const n = Number(valor);
    this.horasMenoresACincuenta.set(Number.isInteger(n) && n > 0 && n < 50);
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
          if (termino.length < 2) {
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
          const previo = this.data.curso;
          if (!previo || texto !== previo.institucionNombre) {
            this.formulario.controls.institucionId.setValue('');
          }
        }
      });
  }
}

function horasEnterasPositivas(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor == null || valor === '') {
    return null;
  }
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) {
    return { horasInvalidas: true };
  }
  return null;
}

function fechasCursoCoherentes(control: AbstractControl): ValidationErrors | null {
  const inicio = control.get('fechaInicio')?.value as Date | null;
  const fin = control.get('fechaFin')?.value as Date | null;
  if (!inicio || !fin) {
    return null;
  }
  return esFechaAnterior(fin, inicio) ? { fechaFinAnterior: true } : null;
}
