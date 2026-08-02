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
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CatalogoItem } from '../../../../../../../domain/models/catalogo-item.model';
import {
  Distincion,
  PUNTAJE_REFERENCIA_TIPO_DISTINCION,
  TOPE_PUNTAJE_RUBRO_DISTINCION,
  TipoDistincionCatalogoItem,
} from '../../../../../../../domain/models/rubro-distincion.model';
import {
  aDateDesdeIso,
  aFechaIsoLocal,
  esIdPersistidoApi,
  nuevoIdLocal,
} from '../../rubros.util';

export interface FormularioDistincionData {
  tiposDistincion: TipoDistincionCatalogoItem[];
  tiposDocumento: CatalogoItem[];
  paises: CatalogoItem[];
  distincion?: Distincion | null;
}

export type DistincionGuardada = Omit<Distincion, 'id'> & { id?: string };

@Component({
  selector: 'app-formulario-distincion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
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
  templateUrl: './formulario-distincion.html',
  styleUrl: './formulario-distincion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioDistincion implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioDistincion>);
  private readonly data = inject<FormularioDistincionData>(MAT_DIALOG_DATA);

  readonly guardar = output<DistincionGuardada>();

  protected readonly tiposDistincion = this.data.tiposDistincion;
  protected readonly tiposDocumento = this.data.tiposDocumento;
  protected readonly paises = this.data.paises;
  protected readonly esActualizacion = esIdPersistidoApi(this.data.distincion?.id);
  protected readonly topeRubro = TOPE_PUNTAJE_RUBRO_DISTINCION;
  protected readonly puntajeReferencia = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    tipoDistincionId: this.fb.nonNullable.control(
      this.data.distincion?.tipoDistincionId ?? '',
      Validators.required
    ),
    tipoDocumentoDistincionId: this.fb.nonNullable.control(
      this.data.distincion?.tipoDocumentoDistincionId ?? '',
      Validators.required
    ),
    descripcion: this.fb.nonNullable.control(this.data.distincion?.descripcion ?? ''),
    fechaDistincion: this.fb.control<Date | null>(
      aDateDesdeIso(this.data.distincion?.fechaDistincion),
      Validators.required
    ),
    institucionOtorgante: this.fb.nonNullable.control(
      this.data.distincion?.institucionOtorgante ?? ''
    ),
    paisId: this.fb.nonNullable.control(this.data.distincion?.paisId ?? ''),
  });

  ngOnInit(): void {
    this.actualizarPuntajeReferencia(this.formulario.controls.tipoDistincionId.value);
    this.formulario.controls.tipoDistincionId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.actualizarPuntajeReferencia(id));
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
    const tipo = this.tiposDistincion.find((item) => item.id === raw.tipoDistincionId);
    const tipoDocumento = this.tiposDocumento.find(
      (item) => item.id === raw.tipoDocumentoDistincionId
    );
    const pais = this.paises.find((item) => item.id === raw.paisId);
    const fecha = raw.fechaDistincion ? aFechaIsoLocal(raw.fechaDistincion) : '';

    if (!tipo || !tipoDocumento || !fecha) {
      return;
    }

    this.guardar.emit({
      id: this.data.distincion?.id ?? nuevoIdLocal('dist'),
      tipoDistincionId: tipo.id,
      tipoDistincionNombre: tipo.nombre,
      tipoDistincionCodigo: tipo.codigo,
      tipoDocumentoDistincionId: tipoDocumento.id,
      tipoDocumentoDistincionNombre: tipoDocumento.nombre,
      descripcion: raw.descripcion.trim(),
      fechaDistincion: fecha,
      institucionOtorgante: raw.institucionOtorgante.trim(),
      paisId: pais?.id ?? '',
      paisNombre: pais?.nombre ?? '',
      archivoId: this.data.distincion?.archivoId ?? null,
      puntaje: this.data.distincion?.puntaje ?? 0,
    });
  }

  private actualizarPuntajeReferencia(tipoId: string): void {
    const tipo = this.tiposDistincion.find((item) => item.id === tipoId);
    if (!tipo?.codigo) {
      this.puntajeReferencia.set(null);
      return;
    }
    this.puntajeReferencia.set(PUNTAJE_REFERENCIA_TIPO_DISTINCION[tipo.codigo] ?? null);
  }
}
