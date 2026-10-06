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
  EstudioIdioma,
  IdiomaCatalogoItem,
  TipoIdioma,
} from '../../../../../../../domain/models/rubro-idioma.model';
import {
  aDateDesdeIso,
  aFechaIsoLocal,
  esIdPersistidoApi,
  nuevoIdLocal,
} from '../../rubros.util';

export interface FormularioIdiomaData {
  idiomas: IdiomaCatalogoItem[];
  nivelesIdioma: CatalogoItem[];
  tiposDocumento: CatalogoItem[];
  estudioIdioma?: EstudioIdioma | null;
}

export type EstudioIdiomaGuardado = Omit<EstudioIdioma, 'id'> & { id?: string };

const TIPOS_IDIOMA: { valor: TipoIdioma; etiqueta: string }[] = [
  { valor: 'NATIVO', etiqueta: 'Nativo' },
  { valor: 'EXTRANJERO', etiqueta: 'Extranjero' },
];

@Component({
  selector: 'app-formulario-idioma',
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
  templateUrl: './formulario-idioma.html',
  styleUrl: './formulario-idioma.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioIdioma implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioIdioma>);
  private readonly data = inject<FormularioIdiomaData>(MAT_DIALOG_DATA);
  private readonly buscarInstituciones = inject(BuscarInstitucionesIdiomaUseCase);

  readonly guardar = output<EstudioIdiomaGuardado>();

  protected readonly tiposIdioma = TIPOS_IDIOMA;
  protected readonly nivelesIdioma = this.data.nivelesIdioma;
  protected readonly tiposDocumento = this.data.tiposDocumento;
  protected readonly esActualizacion = esIdPersistidoApi(this.data.estudioIdioma?.id);
  protected readonly idiomasFiltrados = signal<IdiomaCatalogoItem[]>([]);
  protected readonly institucionesFiltradas = signal<CatalogoItem[]>([]);
  protected readonly buscandoInstituciones = signal(false);

  protected readonly formulario = this.fb.group({
    tipoIdioma: this.fb.nonNullable.control<TipoIdioma>(
      this.data.estudioIdioma?.idiomaTipo || 'EXTRANJERO',
      Validators.required
    ),
    idiomaId: this.fb.nonNullable.control(
      this.data.estudioIdioma?.idiomaId ?? '',
      Validators.required
    ),
    institucionBusqueda: this.fb.nonNullable.control(
      this.data.estudioIdioma?.institucionNombre ?? ''
    ),
    institucionId: this.fb.nonNullable.control(this.data.estudioIdioma?.institucionId ?? ''),
    nivelIdiomaId: this.fb.nonNullable.control(
      this.data.estudioIdioma?.nivelIdiomaId ?? '',
      Validators.required
    ),
    tipoDocumentoIdiomaId: this.fb.nonNullable.control(
      this.data.estudioIdioma?.tipoDocumentoIdiomaId ?? '',
      Validators.required
    ),
    fechaObtencion: this.fb.control<Date | null>(
      aDateDesdeIso(this.data.estudioIdioma?.fechaObtencion),
      Validators.required
    ),
  });

  ngOnInit(): void {
    this.actualizarIdiomasPorTipo(this.formulario.controls.tipoIdioma.value);
    this.escucharTipoIdioma();
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
    const idioma = this.idiomasFiltrados().find((item) => item.id === raw.idiomaId)
      ?? this.data.idiomas.find((item) => item.id === raw.idiomaId);
    const nivel = this.nivelesIdioma.find((item) => item.id === raw.nivelIdiomaId);
    const tipoDocumento = this.tiposDocumento.find(
      (item) => item.id === raw.tipoDocumentoIdiomaId
    );
    const fecha = raw.fechaObtencion ? aFechaIsoLocal(raw.fechaObtencion) : '';

    if (!idioma || !nivel || !tipoDocumento || !fecha) {
      return;
    }

    this.guardar.emit({
      id: this.data.estudioIdioma?.id ?? nuevoIdLocal('idioma'),
      idiomaId: idioma.id,
      idiomaNombre: idioma.nombre,
      idiomaTipo: idioma.tipo,
      nivelIdiomaId: nivel.id,
      nivelIdiomaNombre: nivel.nombre,
      tipoDocumentoIdiomaId: tipoDocumento.id,
      tipoDocumentoNombre: tipoDocumento.nombre,
      institucionId: raw.institucionId.trim(),
      institucionNombre: raw.institucionBusqueda.trim(),
      fechaObtencion: fecha,
      archivoId: this.data.estudioIdioma?.archivoId ?? null,
      puntaje: this.data.estudioIdioma?.puntaje ?? 0,
    });
  }

  private escucharTipoIdioma(): void {
    this.formulario.controls.tipoIdioma.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo) => {
        this.actualizarIdiomasPorTipo(tipo);
        const actual = this.formulario.controls.idiomaId.value;
        if (!this.idiomasFiltrados().some((item) => item.id === actual)) {
          this.formulario.controls.idiomaId.setValue('');
        }
      });
  }

  private actualizarIdiomasPorTipo(tipo: TipoIdioma): void {
    this.idiomasFiltrados.set(this.data.idiomas.filter((item) => item.tipo === tipo));
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
