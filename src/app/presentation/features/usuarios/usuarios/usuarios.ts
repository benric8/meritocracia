import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { finalize, timer } from 'rxjs';
import { USUARIOS_MOCK } from '../data/usuarios-mock.data';
import { FormularioRegistroUsuario } from '../formulario-registro-usuario/formulario-registro-usuario';
import { ListaUsuarios } from '../lista-usuarios/lista-usuarios';
import { NuevoUsuarioGestion, UsuarioGestion } from '../models/usuario-gestion.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, ListaUsuarios, FormularioRegistroUsuario],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly usuarios = signal<UsuarioGestion[]>([...USUARIOS_MOCK]);
  protected readonly cargando = signal(false);
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
    const codigoDuplicado = this.usuarios().some(
      (usuario) => usuario.codigo.toLowerCase() === nuevoUsuario.codigo.toLowerCase()
    );

    if (codigoDuplicado) {
      void Swal.fire({
        icon: 'warning',
        title: 'Código duplicado',
        text: 'Ya existe un usuario con ese código. Ingrese otro código.',
        confirmButtonColor: '#8b0000',
      });
      return;
    }

    this.guardando.set(true);
    timer(600)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false))
      )
      .subscribe(() => {
        const usuario: UsuarioGestion = {
          id: crypto.randomUUID(),
          codigo: nuevoUsuario.codigo,
          nombreCompleto: nuevoUsuario.nombreCompleto,
          cargo: nuevoUsuario.cargo,
          dependencia: nuevoUsuario.dependencia,
          funcion: nuevoUsuario.funcion,
          habilitado: true,
        };

        this.usuarios.update((lista) => [usuario, ...lista]);
        this.mostrarFormulario.set(false);
        this.mensajeExito.set(`Usuario ${usuario.nombreCompleto} registrado correctamente.`);
      });
  }

  protected async onRestablecerClave(usuario: UsuarioGestion): Promise<void> {
    const resultado = await Swal.fire({
      icon: 'question',
      title: 'Restablecer contraseña',
      html: `¿Desea restablecer la contraseña de <strong>${usuario.nombreCompleto}</strong>?`,
      showCancelButton: true,
      confirmButtonText: 'Restablecer',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#8b0000',
    });

    if (!resultado.isConfirmed) {
      return;
    }

    this.cargando.set(true);
    timer(500)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe(() => {
        void Swal.fire({
          icon: 'success',
          title: 'Contraseña restablecida',
          text: `Se envió una contraseña temporal a ${usuario.nombreCompleto}.`,
          confirmButtonColor: '#8b0000',
        });
      });
  }

  protected async onCambiarEstado(usuario: UsuarioGestion): Promise<void> {
    const habilitar = !usuario.habilitado;
    const accion = habilitar ? 'habilitar' : 'deshabilitar';

    const resultado = await Swal.fire({
      icon: 'warning',
      title: habilitar ? 'Habilitar usuario' : 'Deshabilitar usuario',
      html: `¿Confirma que desea ${accion} a <strong>${usuario.nombreCompleto}</strong>?`,
      showCancelButton: true,
      confirmButtonText: habilitar ? 'Habilitar' : 'Deshabilitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#8b0000',
    });

    if (!resultado.isConfirmed) {
      return;
    }

    this.cargando.set(true);
    timer(400)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe(() => {
        this.usuarios.update((lista) =>
          lista.map((item) =>
            item.id === usuario.id ? { ...item, habilitado: habilitar } : item
          )
        );

        this.mensajeExito.set(
          habilitar
            ? `${usuario.nombreCompleto} fue habilitado.`
            : `${usuario.nombreCompleto} fue deshabilitado.`
        );
      });
  }
}
