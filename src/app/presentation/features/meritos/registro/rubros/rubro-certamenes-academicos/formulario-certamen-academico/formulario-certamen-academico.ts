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
  CatalogoCertamen,
  CertamenAcademico,
  JuridicoCertamen,
  LIMITE_TEMA_CERTAMEN,
  OPCIONES_JURIDICO_CERTAMEN,
  TOPE_PUNTAJE_CERTAMENES_ACADEMICOS,
} from '../../../../../../../domain/models/rubro-certamenes-academicos.model';
import {
  aDateDesdeIso,
  aFechaIsoLocal,
  crearFiltroFechaMinima,
  esFechaAnterior,
  nuevoIdLocal,
} from '../../rubros.util';

export interface FormularioCertamenAcademicoData {
  eventos: CatalogoCertamen[];
  modalidades: CatalogoCertamen[];
  tiposParticipacion: CatalogoCertamen[];
  paises: CatalogoItem[];
  especialidades: CatalogoItem[];
  certamen?: CertamenAcademico | null;
}

export type CertamenAcademicoGuardado = Omit<CertamenAcademico, 'id' | 'puntaje'> & {
  id?: string;
  puntaje: number;
};

@Component({
  selector: 'app-formulario-certamen-academico',
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
  templateUrl: './formulario-certamen-academico.html',
  styleUrl: './formulario-certamen-academico.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioCertamenAcademico implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioCertamenAcademico>);
  private readonly data = inject<FormularioCertamenAcademicoData>(MAT_DIALOG_DATA);
  private readonly buscarInstituciones = inject(BuscarInstitucionesUseCase);

  readonly guardar = output<CertamenAcademicoGuardado>();

  protected readonly eventos = this.data.eventos;
  protected readonly modalidades = this.data.modalidades;
  protected readonly tiposParticipacion = this.data.tiposParticipacion;
  protected readonly paises = this.data.paises;
  protected readonly especialidades = this.data.especialidades;
  protected readonly opcionesJuridico = OPCIONES_JURIDICO_CERTAMEN;
  protected readonly limiteTema = LIMITE_TEMA_CERTAMEN;
  protected readonly tope = TOPE_PUNTAJE_CERTAMENES_ACADEMICOS;
  protected readonly institucionesFiltradas = signal<CatalogoItem[]>([]);
  protected readonly filtroFechaFin = crearFiltroFechaMinima(
    () => this.formulario.controls.fechaInicio.value
  );

  protected readonly formulario = this.fb.group(
    {
      eventoId: this.fb.nonNullable.control(this.data.certamen?.eventoId ?? '', Validators.required),
      tipoParticipacionId: this.fb.nonNullable.control(
        this.data.certamen?.tipoParticipacionId ?? '',
        Validators.required
      ),
      modalidadId: this.fb.nonNullable.control(
        this.data.certamen?.modalidadId ?? '',
        Validators.required
      ),
      tema: this.fb.nonNullable.control(this.data.certamen?.tema ?? '', [
        Validators.required,
        Validators.maxLength(LIMITE_TEMA_CERTAMEN),
      ]),
      paisId: this.fb.nonNullable.control(this.data.certamen?.paisId ?? '', Validators.required),
      institucionBusqueda: this.fb.nonNullable.control(
        this.data.certamen?.institucionNombre ?? '',
        Validators.required
      ),
      institucionId: this.fb.nonNullable.control(
        this.data.certamen?.institucionId ?? '',
        Validators.required
      ),
      fechaInicio: this.fb.control<Date | null>(
        aDateDesdeIso(this.data.certamen?.fechaInicio),
        Validators.required
      ),
      fechaFin: this.fb.control<Date | null>(
        aDateDesdeIso(this.data.certamen?.fechaFin),
        Validators.required
      ),
      juridico: this.fb.nonNullable.control<JuridicoCertamen | ''>(
        this.data.certamen?.juridico ?? '',
        Validators.required
      ),
      especialidadId: this.fb.nonNullable.control(
        this.data.certamen?.especialidadId ?? '',
        Validators.required
      ),
    },
    { validators: fechasCertamenCoherentes }
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
    const participacion = this.tiposParticipacion.find((item) => item.id === raw.tipoParticipacionId);
    const modalidad = this.modalidades.find((item) => item.id === raw.modalidadId);
    const pais = this.paises.find((item) => item.id === raw.paisId);
    const especialidad = this.especialidades.find((item) => item.id === raw.especialidadId);

    this.guardar.emit({
      id: this.data.certamen?.id ?? nuevoIdLocal('certamen'),
      eventoId: raw.eventoId,
      eventoDescripcion: evento?.descripcion ?? this.data.certamen?.eventoDescripcion ?? '',
      tipoParticipacionId: raw.tipoParticipacionId,
      tipoParticipacionDescripcion:
        participacion?.descripcion ?? this.data.certamen?.tipoParticipacionDescripcion ?? '',
      institucionId: raw.institucionId,
      institucionNombre: raw.institucionBusqueda.trim(),
      paisId: raw.paisId,
      nombrePais: pais?.nombre ?? this.data.certamen?.nombrePais ?? '',
      fechaInicio: aFechaIsoLocal(raw.fechaInicio),
      fechaFin: aFechaIsoLocal(raw.fechaFin),
      juridico: raw.juridico,
      especialidadId: raw.especialidadId,
      especialidadDescripcion:
        especialidad?.nombre ?? this.data.certamen?.especialidadDescripcion ?? '',
      tema: raw.tema.trim(),
      modalidadId: raw.modalidadId,
      modalidadDescripcion: modalidad?.descripcion ?? this.data.certamen?.modalidadDescripcion ?? '',
      archivoId: this.data.certamen?.archivoId ?? null,
      puntaje: this.data.certamen?.puntaje ?? 0,
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
          const previo = this.data.certamen;
          if (!previo || texto !== previo.institucionNombre) {
            this.formulario.controls.institucionId.setValue('');
          }
        }
      });
  }
}

function fechasCertamenCoherentes(control: AbstractControl): ValidationErrors | null {
  const inicio = control.get('fechaInicio')?.value as Date | null;
  const fin = control.get('fechaFin')?.value as Date | null;
  if (!inicio || !fin) {
    return null;
  }
  return esFechaAnterior(fin, inicio) ? { fechaFinAnterior: true } : null;
}
