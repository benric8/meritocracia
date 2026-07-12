import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PerfilUsuarioConocido } from '../../../../domain/commons/auth-mappers';
import { NuevoUsuarioGestion } from '../../../../domain/models/usuario-gestion.model';
import {
  mensajeErrorCampoUsuarioRegistro,
  OPCIONES_FUNCION_USUARIO,
  VALIDADORES_CARGO,
  VALIDADORES_CODIGO_USUARIO,
  VALIDADORES_DEPENDENCIA,
  VALIDADORES_FUNCION,
  VALIDADORES_NOMBRE_COMPLETO,
} from '../validators/usuario-registro.validators';

@Component({
  selector: 'app-formulario-registro-usuario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './formulario-registro-usuario.html',
  styleUrl: './formulario-registro-usuario.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioRegistroUsuario {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioRegistroUsuario>);

  readonly guardando = signal(false);
  readonly guardar = output<NuevoUsuarioGestion>();

  protected readonly opcionesFuncion = OPCIONES_FUNCION_USUARIO;
  protected readonly mensajeErrorCampo = mensajeErrorCampoUsuarioRegistro;

  protected readonly formulario = this.fb.nonNullable.group({
    nombreCompleto: ['', VALIDADORES_NOMBRE_COMPLETO],
    codigo: ['', VALIDADORES_CODIGO_USUARIO],
    funcion: ['' as PerfilUsuarioConocido | '', VALIDADORES_FUNCION],
    cargo: ['', VALIDADORES_CARGO],
    dependencia: ['', VALIDADORES_DEPENDENCIA],
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

  protected onLimpiar(): void {
    if (this.guardando()) {
      return;
    }
    this.limpiar();
  }

  protected onGuardar(): void {
    if (this.guardando()) {
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { nombreCompleto, codigo, funcion, cargo, dependencia } = this.formulario.getRawValue();
    this.guardar.emit({
      nombreCompleto: nombreCompleto.trim(),
      codigo: codigo.trim(),
      funcion: funcion as PerfilUsuarioConocido,
      cargo: cargo.trim(),
      dependencia: dependencia.trim(),
    });
  }

  private limpiar(): void {
    this.formulario.reset({
      nombreCompleto: '',
      codigo: '',
      funcion: '',
      cargo: '',
      dependencia: '',
    });
  }
}
