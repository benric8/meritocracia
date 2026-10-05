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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { BuscarUniversidadesUseCase } from '../../../../../../../application/use-cases/meritos/buscar-universidades.use-case';
import { CatalogoItem } from '../../../../../../../domain/models/catalogo-item.model';
import {
  ANIO_ESTUDIO_MAX,
  ANIO_ESTUDIO_MIN,
  esPaisPeru,
  EstudioPosgrado,
  LIMITE_MENCION_POSGRADO,
  NOTA_MAXIMA,
  OPCIONES_CONDICION_ACADEMICA_POSGRADO,
  OPCIONES_ESPECIALIDAD_POSGRADO,
  promedioNotasAprobadas,
  puntajeReferenciaSemestre,
  SEMESTRE_MAXIMO,
  SEMESTRE_MINIMO,
  semestrePosgradoDuplicado,
  TOPE_PUNTAJE_ESTUDIOS_POSGRADO,
} from '../../../../../../../domain/models/rubro-estudios-posgrado.model';
import { esIdPersistidoApi, formatearPuntaje, nuevoIdLocal } from '../../rubros.util';

export interface FormularioEstudioPosgradoData {
  paises: CatalogoItem[];
  estudio?: EstudioPosgrado | null;
  existentes: Pick<EstudioPosgrado, 'id' | 'institucionId' | 'mencion' | 'numeroSemestre'>[];
}

export type EstudioPosgradoGuardado = Omit<EstudioPosgrado, 'id' | 'promedio' | 'puntaje'> & {
  id?: string;
  promedio: number | null;
  puntaje: number;
};

@Component({
  selector: 'app-formulario-estudio-posgrado',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
  ],
  templateUrl: './formulario-estudio-posgrado.html',
  styleUrl: './formulario-estudio-posgrado.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioEstudioPosgrado implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioEstudioPosgrado>);
  private readonly data = inject<FormularioEstudioPosgradoData>(MAT_DIALOG_DATA);
  private readonly buscarUniversidades = inject(BuscarUniversidadesUseCase);

  readonly guardar = output<EstudioPosgradoGuardado>();

  protected readonly paises = this.data.paises;
  protected readonly opcionesEspecialidad = OPCIONES_ESPECIALIDAD_POSGRADO;
  protected readonly opcionesCondicion = OPCIONES_CONDICION_ACADEMICA_POSGRADO;
  protected readonly tope = TOPE_PUNTAJE_ESTUDIOS_POSGRADO;
  protected readonly limiteMencion = LIMITE_MENCION_POSGRADO;
  protected readonly anioMin = ANIO_ESTUDIO_MIN;
  protected readonly anioMax = ANIO_ESTUDIO_MAX;
  protected readonly semestreMin = SEMESTRE_MINIMO;
  protected readonly semestreMax = SEMESTRE_MAXIMO;
  protected readonly esActualizacion = esIdPersistidoApi(this.data.estudio?.id);
  protected readonly universidadesFiltradas = signal<CatalogoItem[]>([]);
  protected readonly notas = signal<number[]>([...(this.data.estudio?.notas ?? [])]);
  protected readonly errorNota = signal<string | null>(null);
  protected readonly errorSemestre = signal<string | null>(null);
  protected readonly promedioReferencia = signal<string | null>(null);
  protected readonly puntajeReferencia = signal<string | null>(null);
  protected readonly formatearPuntaje = formatearPuntaje;

  protected readonly formulario = this.fb.group({
    paisId: this.fb.nonNullable.control(
      this.data.estudio?.paisId ?? this.paisPorDefecto(),
      Validators.required
    ),
    universidadBusqueda: this.fb.nonNullable.control(
      this.data.estudio?.institucionNombre ?? '',
      Validators.required
    ),
    institucionId: this.fb.nonNullable.control(
      this.data.estudio?.institucionId ?? '',
      Validators.required
    ),
    especialidad: this.fb.nonNullable.control(
      this.data.estudio?.especialidad ?? '',
      Validators.required
    ),
    mencion: this.fb.nonNullable.control(this.data.estudio?.mencion ?? '', [
      Validators.required,
      Validators.maxLength(LIMITE_MENCION_POSGRADO),
    ]),
    condicionAcademica: this.fb.nonNullable.control(
      this.data.estudio?.condicionAcademica ?? '',
      Validators.required
    ),
    numeroSemestre: this.fb.control<number | null>(this.data.estudio?.numeroSemestre ?? null, [
      Validators.required,
      semestreEnRango,
    ]),
    anioInicio: this.fb.control<number | null>(this.data.estudio?.anioInicio ?? null, [
      Validators.required,
      anioEnRango,
    ]),
    anioFin: this.fb.control<number | null>(this.data.estudio?.anioFin ?? null, [
      Validators.required,
      anioEnRango,
    ]),
    notaPendiente: this.fb.nonNullable.control(''),
  });

  ngOnInit(): void {
    this.formulario.addValidators(anioFinNoAnterior);
    this.actualizarReferencia();
    this.actualizarEstadoBusquedaUniversidad(this.formulario.controls.paisId.value);
    this.escucharBusquedaUniversidad();
    this.escucharCambioPais();
  }

  protected onCerrar(): void {
    this.dialogRef.close();
  }

  protected onSeleccionarUniversidad(universidad: CatalogoItem): void {
    this.formulario.patchValue({
      universidadBusqueda: universidad.nombre,
      institucionId: universidad.id,
    });
  }

  protected onNotaTecla(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ',') {
      return;
    }
    event.preventDefault();
    this.agregarNotaPendiente();
  }

  protected agregarNotaPendiente(): void {
    const texto = this.formulario.controls.notaPendiente.value.replace(',', '.').trim();
    if (!texto) {
      return;
    }

    const nota = Number(texto);
    if (!Number.isFinite(nota) || nota < 0 || nota > NOTA_MAXIMA) {
      this.errorNota.set('Cada nota debe estar entre 0.00 y 20.00.');
      return;
    }

    this.notas.update((lista) => [...lista, Math.round(nota * 100) / 100]);
    this.formulario.controls.notaPendiente.setValue('');
    this.errorNota.set(null);
    this.actualizarReferencia();
  }

  protected quitarNota(indice: number): void {
    this.notas.update((lista) => lista.filter((_, i) => i !== indice));
    this.actualizarReferencia();
  }

  protected onGuardar(): void {
    if (!this.formulario.controls.notaPendiente.value.trim()) {
      this.errorNota.set(null);
    }
    this.agregarNotaPendiente();
    this.formulario.markAllAsTouched();
    this.errorSemestre.set(null);

    if (this.notas().length === 0 && !this.errorNota()) {
      this.errorNota.set('Registre al menos una nota.');
    }

    if (this.formulario.invalid || this.notas().length === 0 || this.errorNota()) {
      return;
    }

    const raw = this.formulario.getRawValue();
    const pais = this.paises.find((item) => item.id === raw.paisId);
    if (!raw.institucionId || raw.numeroSemestre == null || raw.anioInicio == null || raw.anioFin == null) {
      return;
    }

    const id = this.data.estudio?.id ?? nuevoIdLocal('posgrado');
    if (
      semestrePosgradoDuplicado(this.data.existentes, {
        id,
        institucionId: raw.institucionId,
        mencion: raw.mencion,
        numeroSemestre: raw.numeroSemestre,
      })
    ) {
      this.errorSemestre.set(
        'Ese número de semestre ya está registrado para esta universidad y esta mención.'
      );
      return;
    }

    this.guardar.emit({
      id,
      institucionId: raw.institucionId,
      institucionNombre: raw.universidadBusqueda.trim(),
      paisId: raw.paisId,
      paisNombre: pais?.nombre ?? this.data.estudio?.paisNombre ?? '',
      especialidad: raw.especialidad,
      mencion: raw.mencion.trim(),
      condicionAcademica: raw.condicionAcademica,
      numeroSemestre: raw.numeroSemestre,
      anioInicio: raw.anioInicio,
      anioFin: raw.anioFin,
      notas: this.notas(),
      promedio: this.data.estudio?.promedio ?? null,
      puntaje: this.data.estudio?.puntaje ?? 0,
    });
  }

  private paisPorDefecto(): string {
    return this.paises.find((item) => esPaisPeru(item.nombre))?.id ?? '';
  }

  private escucharCambioPais(): void {
    this.formulario.controls.paisId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((paisId) => {
        this.actualizarEstadoBusquedaUniversidad(paisId);
        this.formulario.patchValue({
          universidadBusqueda: '',
          institucionId: '',
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
            return of<CatalogoItem[]>([]);
          }
          return this.buscarUniversidades
            .ejecutar(termino, paisId, 20)
            .pipe(map((resultado) => (resultado.exito ? resultado.universidades : [])));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((filtradas) => this.universidadesFiltradas.set(filtradas));

    this.formulario.controls.universidadBusqueda.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valor) => {
        const texto = valor?.trim() ?? '';
        const actual = this.universidadesFiltradas().find((item) => item.nombre === texto);
        if (!actual && this.formulario.controls.institucionId.value) {
          const previo = this.data.estudio;
          if (!previo || texto !== previo.institucionNombre) {
            this.formulario.controls.institucionId.setValue('');
          }
        }
      });
  }

  private actualizarReferencia(): void {
    const notas = this.notas();
    if (!notas.length) {
      this.promedioReferencia.set(null);
      this.puntajeReferencia.set(null);
      return;
    }
    const promedio = promedioNotasAprobadas(notas);
    this.promedioReferencia.set(promedio == null ? null : promedio.toFixed(2));
    this.puntajeReferencia.set(puntajeReferenciaSemestre(notas).toFixed(3));
  }
}

function semestreEnRango(control: AbstractControl): ValidationErrors | null {
  if (control.value == null || control.value === '') {
    return null;
  }
  const n = Number(control.value);
  if (!Number.isInteger(n) || n < SEMESTRE_MINIMO || n > SEMESTRE_MAXIMO) {
    return { semestre: true };
  }
  return null;
}

function anioEnRango(control: AbstractControl): ValidationErrors | null {
  if (control.value == null || control.value === '') {
    return null;
  }
  const n = Number(control.value);
  if (!Number.isInteger(n) || n < ANIO_ESTUDIO_MIN || n > ANIO_ESTUDIO_MAX) {
    return { anio: true };
  }
  return null;
}

function anioFinNoAnterior(control: AbstractControl): ValidationErrors | null {
  const inicio = Number(control.get('anioInicio')?.value);
  const fin = Number(control.get('anioFin')?.value);
  if (!Number.isInteger(inicio) || !Number.isInteger(fin)) {
    return null;
  }
  return fin < inicio ? { anioFin: true } : null;
}
