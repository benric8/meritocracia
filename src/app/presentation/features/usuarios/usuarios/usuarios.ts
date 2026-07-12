import { Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';
import { CambiarEstadoUsuarioUseCase } from '../../../../application/use-cases/usuarios/cambiar-estado-usuario.use-case';
import { RegistrarUsuarioUseCase } from '../../../../application/use-cases/usuarios/registrar-usuario.use-case';
import { ResetearClaveUsuarioUseCase } from '../../../../application/use-cases/usuarios/resetear-clave-usuario.use-case';
import { NuevoUsuarioGestion, UsuarioGestion } from '../../../../domain/models/usuario-gestion.model';
import { temaUi } from '../../../styles/tema-ui.constants';
import { FormularioRegistroUsuario } from '../formulario-registro-usuario/formulario-registro-usuario';
import { ListaUsuarios } from '../lista-usuarios/lista-usuarios';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, ListaUsuarios],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly registrarUsuario = inject(RegistrarUsuarioUseCase);
  private readonly resetearClaveUsuario = inject(ResetearClaveUsuarioUseCase);
  private readonly cambiarEstadoUsuario = inject(CambiarEstadoUsuarioUseCase);
  private readonly listaUsuarios = viewChild(ListaUsuarios);

  protected readonly mensajeExito = signal<string | null>(null);

  protected abrirFormulario(): void {
    this.mensajeExito.set(null);

    const ref = this.dialog.open(FormularioRegistroUsuario, {
      width: '720px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
    });

    const guardarSub = ref.componentInstance.guardar.subscribe((nuevoUsuario) => {
      this.onGuardarUsuario(nuevoUsuario, ref);
    });

    ref.afterClosed().subscribe(() => guardarSub.unsubscribe());
  }

  private onGuardarUsuario(
    nuevoUsuario: NuevoUsuarioGestion,
    dialogRef: MatDialogRef<FormularioRegistroUsuario>
  ): void {
    dialogRef.componentInstance.guardando.set(true);

    this.registrarUsuario
      .ejecutar(nuevoUsuario)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => dialogRef.componentInstance.guardando.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito || !resultado.usuario) {
          void Swal.fire({
            icon: 'error',
            title: 'No se pudo registrar',
            text: resultado.mensaje ?? 'No se pudo registrar el usuario.',
            confirmButtonColor: temaUi.COLOR_PRIMARIO,
          });
          return;
        }

        dialogRef.close();
        this.mensajeExito.set(`Usuario ${resultado.usuario.nombreCompleto} registrado correctamente.`);
        this.listaUsuarios()?.recargar(1);
      });
  }

  protected async onRestablecerClave(usuario: UsuarioGestion): Promise<void> {
    const confirmacion = await Swal.fire({
      icon: 'question',
      title: 'Restablecer contraseña',
      html: `¿Desea restablecer la contraseña de <strong>${usuario.nombreCompleto}</strong>?`,
      showCancelButton: true,
      confirmButtonText: 'Restablecer',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: temaUi.COLOR_PRIMARIO,
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    this.resetearClaveUsuario
      .ejecutar(usuario.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void Swal.fire({
            icon: 'error',
            title: 'No se pudo restablecer',
            text: resultado.mensaje ?? 'No se pudo restablecer la contraseña.',
            confirmButtonColor: temaUi.COLOR_PRIMARIO,
          });
          return;
        }

        void Swal.fire({
          icon: 'success',
          title: 'Contraseña restablecida',
          text: `Se restableció la contraseña de ${usuario.nombreCompleto}.`,
          confirmButtonColor: temaUi.COLOR_PRIMARIO,
        });
      });
  }

  protected async onCambiarEstado(usuario: UsuarioGestion): Promise<void> {
    const habilitar = !usuario.habilitado;
    const accion = habilitar ? 'habilitar' : 'deshabilitar';

    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: habilitar ? 'Habilitar usuario' : 'Deshabilitar usuario',
      html: `¿Confirma que desea ${accion} a <strong>${usuario.nombreCompleto}</strong>?`,
      showCancelButton: true,
      confirmButtonText: habilitar ? 'Habilitar' : 'Deshabilitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: temaUi.COLOR_PRIMARIO,
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    this.cambiarEstadoUsuario
      .ejecutar(usuario.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void Swal.fire({
            icon: 'error',
            title: 'No se pudo cambiar el estado',
            text: resultado.mensaje ?? 'No se pudo cambiar el estado del usuario.',
            confirmButtonColor: temaUi.COLOR_PRIMARIO,
          });
          return;
        }

        this.mensajeExito.set(
          habilitar
            ? `${usuario.nombreCompleto} fue habilitado.`
            : `${usuario.nombreCompleto} fue deshabilitado.`
        );
        this.listaUsuarios()?.recargar();
      });
  }
}
