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
  JuridicoPasantia,
  LIMITE_MENCION_PASANTIA,
  OPCIONES_JURIDICO_PASANTIA,
  Pasantia,
  TipoPasantiaCatalogo,
  TOPE_PUNTAJE_PASANTIAS,
} from '../../../../../../../domain/models/rubro-pasantias.model';
import {
  aDateDesdeIso,
  aFechaIsoLocal,
  crearFiltroFechaMinima,
  esFechaAnterior,
  nuevoIdLocal,
} from '../../rubros.util';

export interface FormularioPasantiaData {
  tipos: TipoPasantiaCatalogo[];
  paises: CatalogoItem[];
  especialidades: CatalogoItem[];
  pasantia?: Pasantia | null;
}

export type PasantiaGuardada = Omit<Pasantia, 'id' | 'puntaje'> & {
  id?: string;
  puntaje: number;
};

@Component({
  selector: 'app-formulario-pasantia',
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
  templateUrl: './formulario-pasantia.html',
  styleUrl: './formulario-pasantia.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioPasantia implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioPasantia>);
  private readonly data = inject<FormularioPasantiaData>(MAT_DIALOG_DATA);
  private readonly buscarInstituciones = inject(BuscarInstitucionesUseCase);

  readonly guardar = output<PasantiaGuardada>();

  protected readonly tipos = this.data.tipos;
  protected readonly paises = this.data.paises;
  protected readonly especialidades = this.data.especialidades;
  protected readonly opcionesJuridico = OPCIONES_JURIDICO_PASANTIA;
  protected readonly limiteMencion = LIMITE_MENCION_PASANTIA;
  protected readonly tope = TOPE_PUNTAJE_PASANTIAS;
  protected readonly institucionesFiltradas = signal<CatalogoItem[]>([]);
  protected readonly filtroFechaFin = crearFiltroFechaMinima(
    () => this.formulario.controls.fechaInicio.value
  );

  protected readonly formulario = this.fb.group(
    {
      tipoPasantiaId: this.fb.nonNullable.control(
        this.data.pasantia?.tipoPasantiaId ?? '',
        Validators.required
      ),
      paisId: this.fb.nonNullable.control(this.data.pasantia?.paisId ?? '', Validators.required),
      institucionBusqueda: this.fb.nonNullable.control(
        this.data.pasantia?.institucionNombre ?? '',
        Validators.required
      ),
      institucionId: this.fb.nonNullable.control(
        this.data.pasantia?.institucionId ?? '',
        Validators.required
      ),
      fechaInicio: this.fb.control<Date | null>(
        aDateDesdeIso(this.data.pasantia?.fechaInicio),
        Validators.required
      ),
      fechaFin: this.fb.control<Date | null>(
        aDateDesdeIso(this.data.pasantia?.fechaFin),
        Validators.required
      ),
      juridico: this.fb.nonNullable.control<JuridicoPasantia | ''>(
        this.data.pasantia?.juridico ?? '',
        Validators.required
      ),
      especialidadId: this.fb.nonNullable.control(
        this.data.pasantia?.especialidadId ?? '',
        Validators.required
      ),
      mencion: this.fb.nonNullable.control(this.data.pasantia?.mencion ?? '', [
        Validators.maxLength(LIMITE_MENCION_PASANTIA),
      ]),
    },
    { validators: fechasPasantiaCoherentes }
  );

  ngOnInit(): void {
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
    if (
      !raw.fechaInicio ||
      !raw.fechaFin ||
      !raw.institucionId ||
      (raw.juridico !== '1' && raw.juridico !== '0')
    ) {
      return;
    }

    const tipo = this.tipos.find((item) => item.id === raw.tipoPasantiaId);
    const pais = this.paises.find((item) => item.id === raw.paisId);
    const especialidad = this.especialidades.find((item) => item.id === raw.especialidadId);

    this.guardar.emit({
      id: this.data.pasantia?.id ?? nuevoIdLocal('pasantia'),
      tipoPasantiaId: raw.tipoPasantiaId,
      tipoPasantiaDescripcion:
        tipo?.descripcion ?? this.data.pasantia?.tipoPasantiaDescripcion ?? '',
      institucionId: raw.institucionId,
      institucionNombre: raw.institucionBusqueda.trim(),
      paisId: raw.paisId,
      paisNombre: pais?.nombre ?? this.data.pasantia?.paisNombre ?? '',
      fechaInicio: aFechaIsoLocal(raw.fechaInicio),
      fechaFin: aFechaIsoLocal(raw.fechaFin),
      juridico: raw.juridico,
      especialidadId: raw.especialidadId,
      especialidadDescripcion:
        especialidad?.nombre ?? this.data.pasantia?.especialidadDescripcion ?? '',
      mencion: raw.mencion.trim(),
      archivoId: this.data.pasantia?.archivoId ?? null,
      puntaje: this.data.pasantia?.puntaje ?? 0,
    });
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
          const previo = this.data.pasantia;
          if (!previo || texto !== previo.institucionNombre) {
            this.formulario.controls.institucionId.setValue('');
          }
        }
      });
  }
}

function fechasPasantiaCoherentes(control: AbstractControl): ValidationErrors | null {
  const inicio = control.get('fechaInicio')?.value as Date | null;
  const fin = control.get('fechaFin')?.value as Date | null;
  if (!inicio || !fin) {
    return null;
  }
  return esFechaAnterior(fin, inicio) ? { fechaFinAnterior: true } : null;
}
