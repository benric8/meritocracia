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
import { BuscarInstitucionesUniversitariasUseCase } from '../../../../../../../application/use-cases/meritos/buscar-instituciones-universitarias.use-case';
import { CatalogoItem } from '../../../../../../../domain/models/catalogo-item.model';
import {
  DocenciaUniversitaria,
  LIMITES_DOCENCIA,
  OPCIONES_ORDEN_JURIDICO_DOCENCIA,
  OrdenJuridicoDocencia,
  TIPOS_DOCUMENTO_DOCENCIA,
  TOPE_PUNTAJE_RUBRO_DOCENCIA,
} from '../../../../../../../domain/models/rubro-docencia.model';
import {
  aDateDesdeIso,
  aFechaIsoLocal,
  corregirFechaFinSiAnteriorAInicio,
  crearFiltroFechaMinima,
  esFechaAnterior,
  esIdPersistidoApi,
  nuevoIdLocal,
} from '../../rubros.util';

export interface FormularioDocenciaData {
  especialidades: CatalogoItem[];
  docencia?: DocenciaUniversitaria | null;
}

export type DocenciaGuardada = Omit<DocenciaUniversitaria, 'id'> & { id?: string };

function enteroMayorQueCero(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor == null || valor === '') {
    return null;
  }
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) {
    return { entero: true };
  }
  return null;
}

function fechasDocenciaCoherentes(control: AbstractControl): ValidationErrors | null {
  const inicio = control.get('fechaInicio')?.value as Date | null;
  const fin = control.get('fechaFin')?.value as Date | null;
  if (!inicio || !fin) {
    return null;
  }
  return esFechaAnterior(fin, inicio) ? { fechaFinAnterior: true } : null;
}

@Component({
  selector: 'app-formulario-docencia',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
  ],
  templateUrl: './formulario-docencia.html',
  styleUrl: './formulario-docencia.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioDocencia implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioDocencia>);
  private readonly data = inject<FormularioDocenciaData>(MAT_DIALOG_DATA);
  private readonly buscarUniversidades = inject(BuscarInstitucionesUniversitariasUseCase);

  readonly guardar = output<DocenciaGuardada>();

  protected readonly opcionesOrden = OPCIONES_ORDEN_JURIDICO_DOCENCIA;
  protected readonly topeRubro = TOPE_PUNTAJE_RUBRO_DOCENCIA;
  protected readonly limites = LIMITES_DOCENCIA;
  protected readonly esActualizacion = esIdPersistidoApi(this.data.docencia?.id);
  protected readonly tiposDocumento: { valor: string; etiqueta: string }[];
  protected readonly especialidades: CatalogoItem[];
  protected readonly universidadesFiltradas = signal<CatalogoItem[]>([]);

  protected readonly formulario = this.fb.group(
    {
      descripcionDocumento: this.fb.nonNullable.control(
        this.data.docencia?.descripcionDocumento ?? '',
        Validators.required
      ),
      universidad: this.fb.nonNullable.control(this.data.docencia?.universidad ?? '', [
        Validators.required,
        Validators.maxLength(LIMITES_DOCENCIA.universidad),
      ]),
      horasSemanales: this.fb.control<number | null>(
        this.data.docencia?.horasSemanales ?? null,
        [Validators.required, Validators.min(1), enteroMayorQueCero]
      ),
      fechaInicio: this.fb.control<Date | null>(
        aDateDesdeIso(this.data.docencia?.fechaInicio),
        Validators.required
      ),
      fechaFin: this.fb.control<Date | null>(
        aDateDesdeIso(this.data.docencia?.fechaFin),
        Validators.required
      ),
      ordenJuridico: this.fb.nonNullable.control<OrdenJuridicoDocencia>(
        this.data.docencia?.ordenJuridico ?? 'JURIDICO',
        Validators.required
      ),
      especialidad: this.fb.nonNullable.control(this.data.docencia?.especialidad ?? '', [
        Validators.maxLength(LIMITES_DOCENCIA.especialidad),
      ]),
      materia: this.fb.nonNullable.control(this.data.docencia?.materia ?? '', [
        Validators.required,
        Validators.maxLength(LIMITES_DOCENCIA.materia),
      ]),
      categoria: this.fb.nonNullable.control(this.data.docencia?.categoria ?? '', [
        Validators.maxLength(LIMITES_DOCENCIA.categoria),
      ]),
      condicion: this.fb.nonNullable.control(this.data.docencia?.condicion ?? '', [
        Validators.maxLength(LIMITES_DOCENCIA.condicion),
      ]),
    },
    { validators: fechasDocenciaCoherentes }
  );

  protected readonly filtroFechaFin = crearFiltroFechaMinima(
    () => this.formulario.controls.fechaInicio.value
  );

  constructor() {
    const tipoActual = this.data.docencia?.descripcionDocumento?.trim() ?? '';
    const tipoConocido = TIPOS_DOCUMENTO_DOCENCIA.some((item) => item.valor === tipoActual);
    this.tiposDocumento =
      tipoActual && !tipoConocido
        ? [...TIPOS_DOCUMENTO_DOCENCIA, { valor: tipoActual, etiqueta: tipoActual }]
        : [...TIPOS_DOCUMENTO_DOCENCIA];

    const especialidadActual = this.data.docencia?.especialidad?.trim() ?? '';
    const base = this.data.especialidades ?? [];
    const especialidadConocida = base.some((item) => item.nombre === especialidadActual);
    this.especialidades =
      especialidadActual && !especialidadConocida
        ? [{ id: 'actual', nombre: especialidadActual }, ...base]
        : base;
  }

  ngOnInit(): void {
    this.formulario.controls.fechaInicio.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((inicio) => {
        const fin = this.formulario.controls.fechaFin.value;
        const corregida = corregirFechaFinSiAnteriorAInicio(inicio, fin);
        if (corregida !== fin) {
          this.formulario.controls.fechaFin.setValue(corregida);
        }
      });

    this.formulario.controls.universidad.valueChanges
      .pipe(
        startWith(this.formulario.controls.universidad.value),
        debounceTime(300),
        map((valor) => valor?.trim() ?? ''),
        distinctUntilChanged(),
        switchMap((termino) => {
          if (termino.length < 2) {
            return of<CatalogoItem[]>([]);
          }
          return this.buscarUniversidades
            .ejecutar(termino)
            .pipe(map((resultado) => (resultado.exito ? resultado.instituciones : [])));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((filtradas) => this.universidadesFiltradas.set(filtradas));
  }

  protected onCerrar(): void {
    this.dialogRef.close();
  }

  protected onGuardar(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      return;
    }

    const raw = this.formulario.getRawValue();
    const fechaInicio = raw.fechaInicio ? aFechaIsoLocal(raw.fechaInicio) : '';
    const fechaFin = raw.fechaFin ? aFechaIsoLocal(raw.fechaFin) : '';
    const horas = Number(raw.horasSemanales);

    if (!raw.descripcionDocumento || !fechaInicio || !fechaFin || !Number.isInteger(horas)) {
      return;
    }

    this.guardar.emit({
      id: this.data.docencia?.id ?? nuevoIdLocal('doc'),
      descripcionDocumento: raw.descripcionDocumento,
      universidad: raw.universidad.trim(),
      horasSemanales: horas,
      fechaInicio,
      fechaFin,
      ordenJuridico: raw.ordenJuridico,
      especialidad: raw.especialidad.trim(),
      materia: raw.materia.trim(),
      categoria: raw.categoria.trim(),
      condicion: raw.condicion.trim(),
      archivoId: this.data.docencia?.archivoId ?? null,
      puntaje: this.data.docencia?.puntaje ?? 0,
    });
  }
}
