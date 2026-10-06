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
import { CatalogoCertamen } from '../../../../../../../domain/models/rubro-certamenes-academicos.model';
import {
  AsistenciaEventoAcademico,
  JuridicoAsistenciaEvento,
  LIMITE_TEMA_ASISTENCIA_EVENTO,
  OPCIONES_JURIDICO_ASISTENCIA_EVENTO,
  TOPE_PUNTAJE_ASISTENCIAS_EVENTOS,
} from '../../../../../../../domain/models/rubro-asistencias-eventos.model';
import {
  aDateDesdeIso,
  aFechaIsoLocal,
  crearFiltroFechaMinima,
  esFechaAnterior,
  nuevoIdLocal,
} from '../../rubros.util';

export interface FormularioAsistenciaEventoData {
  eventos: CatalogoCertamen[];
  modalidades: CatalogoCertamen[];
  tiposDocumento: CatalogoItem[];
  paises: CatalogoItem[];
  especialidades: CatalogoItem[];
  asistencia?: AsistenciaEventoAcademico | null;
}

export type AsistenciaEventoGuardada = Omit<AsistenciaEventoAcademico, 'id' | 'puntaje'> & {
  id?: string;
  puntaje: number;
};

@Component({
  selector: 'app-formulario-asistencia-evento',
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
  templateUrl: './formulario-asistencia-evento.html',
  styleUrl: './formulario-asistencia-evento.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioAsistenciaEvento implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioAsistenciaEvento>);
  private readonly data = inject<FormularioAsistenciaEventoData>(MAT_DIALOG_DATA);
  private readonly buscarInstituciones = inject(BuscarInstitucionesUseCase);

  readonly guardar = output<AsistenciaEventoGuardada>();

  protected readonly eventos = this.data.eventos;
  protected readonly modalidades = this.data.modalidades;
  protected readonly tiposDocumento = this.data.tiposDocumento;
  protected readonly paises = this.data.paises;
  protected readonly especialidades = this.data.especialidades;
  protected readonly opcionesJuridico = OPCIONES_JURIDICO_ASISTENCIA_EVENTO;
  protected readonly limiteTema = LIMITE_TEMA_ASISTENCIA_EVENTO;
  protected readonly tope = TOPE_PUNTAJE_ASISTENCIAS_EVENTOS;
  protected readonly institucionesFiltradas = signal<CatalogoItem[]>([]);
  protected readonly filtroFechaFin = crearFiltroFechaMinima(
    () => this.formulario.controls.fechaInicio.value
  );

  protected readonly formulario = this.fb.group(
    {
      eventoId: this.fb.nonNullable.control(this.data.asistencia?.eventoId ?? '', Validators.required),
      modalidadId: this.fb.nonNullable.control(
        this.data.asistencia?.modalidadId ?? '',
        Validators.required
      ),
      tipoDocumentoId: this.fb.nonNullable.control(
        this.data.asistencia?.tipoDocumentoId ?? '',
        Validators.required
      ),
      tema: this.fb.nonNullable.control(this.data.asistencia?.tema ?? '', [
        Validators.required,
        Validators.maxLength(LIMITE_TEMA_ASISTENCIA_EVENTO),
      ]),
      paisId: this.fb.nonNullable.control(this.data.asistencia?.paisId ?? '', Validators.required),
      institucionBusqueda: this.fb.nonNullable.control(
        this.data.asistencia?.institucionNombre ?? '',
        Validators.required
      ),
      institucionId: this.fb.nonNullable.control(
        this.data.asistencia?.institucionId ?? '',
        Validators.required
      ),
      fechaInicio: this.fb.control<Date | null>(
        aDateDesdeIso(this.data.asistencia?.fechaInicio),
        Validators.required
      ),
      fechaFin: this.fb.control<Date | null>(
        aDateDesdeIso(this.data.asistencia?.fechaFin),
        Validators.required
      ),
      juridico: this.fb.nonNullable.control<JuridicoAsistenciaEvento | ''>(
        this.data.asistencia?.juridico ?? '',
        Validators.required
      ),
      especialidadId: this.fb.nonNullable.control(
        this.data.asistencia?.especialidadId ?? '',
        Validators.required
      ),
    },
    { validators: fechasAsistenciaCoherentes }
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

    const evento = this.eventos.find((item) => item.id === raw.eventoId);
    const modalidad = this.modalidades.find((item) => item.id === raw.modalidadId);
    const tipoDocumento = this.tiposDocumento.find((item) => item.id === raw.tipoDocumentoId);
    const pais = this.paises.find((item) => item.id === raw.paisId);
    const especialidad = this.especialidades.find((item) => item.id === raw.especialidadId);

    this.guardar.emit({
      id: this.data.asistencia?.id ?? nuevoIdLocal('asistencia'),
      eventoId: raw.eventoId,
      eventoDescripcion: evento?.descripcion ?? this.data.asistencia?.eventoDescripcion ?? '',
      institucionId: raw.institucionId,
      institucionNombre: raw.institucionBusqueda.trim(),
      paisId: raw.paisId,
      nombrePais: pais?.nombre ?? this.data.asistencia?.nombrePais ?? '',
      fechaInicio: aFechaIsoLocal(raw.fechaInicio),
      fechaFin: aFechaIsoLocal(raw.fechaFin),
      juridico: raw.juridico,
      especialidadId: raw.especialidadId,
      especialidadDescripcion:
        especialidad?.nombre ?? this.data.asistencia?.especialidadDescripcion ?? '',
      tema: raw.tema.trim(),
      modalidadId: raw.modalidadId,
      modalidadDescripcion: modalidad?.descripcion ?? this.data.asistencia?.modalidadDescripcion ?? '',
      tipoDocumentoId: raw.tipoDocumentoId,
      tipoDocumentoDescripcion:
        tipoDocumento?.nombre ?? this.data.asistencia?.tipoDocumentoDescripcion ?? '',
      archivoId: this.data.asistencia?.archivoId ?? null,
      puntaje: this.data.asistencia?.puntaje ?? 0,
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
          const previo = this.data.asistencia;
          if (!previo || texto !== previo.institucionNombre) {
            this.formulario.controls.institucionId.setValue('');
          }
        }
      });
  }
}

function fechasAsistenciaCoherentes(control: AbstractControl): ValidationErrors | null {
  const inicio = control.get('fechaInicio')?.value as Date | null;
  const fin = control.get('fechaFin')?.value as Date | null;
  if (!inicio || !fin) {
    return null;
  }
  return esFechaAnterior(fin, inicio) ? { fechaFinAnterior: true } : null;
}
