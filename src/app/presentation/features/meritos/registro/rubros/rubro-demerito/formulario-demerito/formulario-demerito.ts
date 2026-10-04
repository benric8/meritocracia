import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  Demerito,
  LIMITE_OBSERVACION_DEMERITO,
  OPCIONES_TIPO_MEDIDA,
  TIPOS_DOCUMENTO_DEMERITO,
  TipoMedidaDemerito,
} from '../../../../../../../domain/models/rubro-demerito.model';
import { esIdPersistidoApi, nuevoIdLocal } from '../../rubros.util';

export interface FormularioDemeritoData {
  demerito?: Demerito | null;
}

export type DemeritoGuardado = Omit<Demerito, 'id' | 'anioValoracion'> & { id?: string };

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

@Component({
  selector: 'app-formulario-demerito',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './formulario-demerito.html',
  styleUrl: './formulario-demerito.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioDemerito implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioDemerito>);
  private readonly data = inject<FormularioDemeritoData>(MAT_DIALOG_DATA);

  readonly guardar = output<DemeritoGuardado>();

  protected readonly opcionesMedida = OPCIONES_TIPO_MEDIDA;
  protected readonly limiteObservacion = LIMITE_OBSERVACION_DEMERITO;
  protected readonly esActualizacion = esIdPersistidoApi(this.data.demerito?.id);
  protected readonly tiposDocumento: { valor: string; etiqueta: string }[];
  protected readonly puntajeReferencia = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    tipoMedida: this.fb.nonNullable.control<TipoMedidaDemerito | ''>(
      this.data.demerito?.tipoMedida ?? '',
      Validators.required
    ),
    cantidad: this.fb.control<number | null>(this.data.demerito?.cantidad ?? null, [
      Validators.required,
      Validators.min(1),
      enteroMayorQueCero,
    ]),
    descripcionDocumento: this.fb.nonNullable.control(
      this.data.demerito?.descripcionDocumento ?? '',
      Validators.required
    ),
    observacion: this.fb.nonNullable.control(this.data.demerito?.observacion ?? '', [
      Validators.required,
      Validators.maxLength(LIMITE_OBSERVACION_DEMERITO),
    ]),
  });

  constructor() {
    const tipoActual = this.data.demerito?.descripcionDocumento?.trim() ?? '';
    const tipoConocido = TIPOS_DOCUMENTO_DEMERITO.some((item) => item.valor === tipoActual);
    this.tiposDocumento =
      tipoActual && !tipoConocido
        ? [...TIPOS_DOCUMENTO_DEMERITO, { valor: tipoActual, etiqueta: tipoActual }]
        : [...TIPOS_DOCUMENTO_DEMERITO];
  }

  ngOnInit(): void {
    this.actualizarReferencia(this.formulario.controls.tipoMedida.value);
    this.formulario.controls.tipoMedida.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo) => this.actualizarReferencia(tipo));
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
    const cantidad = Number(raw.cantidad);
    if (!raw.tipoMedida || !raw.descripcionDocumento || !Number.isInteger(cantidad)) {
      return;
    }

    this.guardar.emit({
      id: this.data.demerito?.id ?? nuevoIdLocal('dem'),
      tipoMedida: raw.tipoMedida,
      cantidad,
      descripcionDocumento: raw.descripcionDocumento,
      observacion: raw.observacion.trim(),
      archivoId: this.data.demerito?.archivoId ?? null,
      puntaje: this.data.demerito?.puntaje ?? 0,
    });
  }

  private actualizarReferencia(tipo: TipoMedidaDemerito | ''): void {
    const opcion = this.opcionesMedida.find((item) => item.valor === tipo);
    this.puntajeReferencia.set(opcion?.referencia ?? null);
  }
}
