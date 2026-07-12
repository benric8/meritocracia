import { Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';
import { CambiarEstadoUsuarioUseCase } from '../../../../application/use-cases/usuarios/cambiar-estado-usuario.use-case';
import { RegistrarUsuarioUseCase } from '../../../../application/use-cases/usuarios/registrar-usuario.use-case';
import { ResetearClaveUsuarioUseCase } from '../../../../application/use-cases/usuarios/resetear-clave-usuario.use-case';
import { FormularioRegistroUsuario } from '../formulario-registro-usuario/formulario-registro-usuario';
import { ListaUsuarios } from '../lista-usuarios/lista-usuarios';
import { NuevoUsuarioGestion, UsuarioGestion } from '../../../../domain/models/usuario-gestion.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, ListaUsuarios, FormularioRegistroUsuario],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios {
  private readonly destroyRef = inject(DestroyRef);
  private readonly registrarUsuario = inject(RegistrarUsuarioUseCase);
  private readonly resetearClaveUsuario = inject(ResetearClaveUsuarioUseCase);
  private readonly cambiarEstadoUsuario = inject(CambiarEstadoUsuarioUseCase);
  private readonly listaUsuarios = viewChild(ListaUsuarios);

  protected readonly guardando = signal(false);
  protected readonly mostrarFormulario = signal(false);
  protected readonly mensajeExito = signal<string | null>(null);

  protected abrirFormulario(): void {
    this.mensajeExito.set(null);
    this.mostrarFormulario.set(true);
  }

  protected cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  protected onGuardarUsuario(nuevoUsuario: NuevoUsuarioGestion): void {
    this.guardando.set(true);
    this.registrarUsuario
      .ejecutar(nuevoUsuario)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito || !resultado.usuario) {
          void Swal.fire({
            icon: 'error',
            title: 'No se pudo registrar',
            text: resultado.mensaje ?? 'No se pudo registrar el usuario.',
            confirmButtonColor: '#8b0000',
          });
          return;
        }

        this.mostrarFormulario.set(false);
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
      confirmButtonColor: '#8b0000',
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
            confirmButtonColor: '#8b0000',
          });
          return;
        }

        void Swal.fire({
          icon: 'success',
          title: 'Contraseña restablecida',
          text: `Se restableció la contraseña de ${usuario.nombreCompleto}.`,
          confirmButtonColor: '#8b0000',
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
      confirmButtonColor: '#8b0000',
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
            confirmButtonColor: '#8b0000',
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
