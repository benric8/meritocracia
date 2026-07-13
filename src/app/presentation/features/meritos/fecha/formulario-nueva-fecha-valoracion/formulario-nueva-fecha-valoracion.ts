import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NuevaFechaValoracion } from '../../../../../domain/models/fecha-valoracion.model';
import {
  fechaHoyIso,
  mensajeErrorCampoFechaValoracion,
  RESOLUCION_MAX_LENGTH,
  VALIDADORES_FECHA_VALORACION,
  VALIDADORES_RESOLUCION,
} from '../fecha-valoracion.util';

export interface FormularioNuevaFechaValoracionData {
  hayConfiguracionVigente: boolean;
}

@Component({
  selector: 'app-formulario-nueva-fecha-valoracion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './formulario-nueva-fecha-valoracion.html',
  styleUrl: './formulario-nueva-fecha-valoracion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioNuevaFechaValoracion {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioNuevaFechaValoracion>);
  private readonly data = inject<FormularioNuevaFechaValoracionData>(MAT_DIALOG_DATA);

  readonly guardando = signal(false);
  readonly guardar = output<NuevaFechaValoracion>();

  protected readonly hayConfiguracionVigente = this.data.hayConfiguracionVigente;
  protected readonly resolucionMaxLength = RESOLUCION_MAX_LENGTH;
  protected readonly mensajeErrorCampo = mensajeErrorCampoFechaValoracion;

  protected readonly formulario = this.fb.nonNullable.group({
    fechaValoracion: [fechaHoyIso(), VALIDADORES_FECHA_VALORACION],
    resolucion: ['', VALIDADORES_RESOLUCION],
  });

  constructor() {
    effect(() => {
      this.dialogRef.disableClose = this.guardando();
    });
  }

  protected onCerrar(): void {
    if (this.guardando()) {
      return;
    }
    this.dialogRef.close();
  }

  protected onGuardar(): void {
    if (this.guardando()) {
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { fechaValoracion, resolucion } = this.formulario.getRawValue();
    this.guardar.emit({
      fechaValoracion: fechaValoracion.trim(),
      resolucion: resolucion.trim(),
    });
  }
}
