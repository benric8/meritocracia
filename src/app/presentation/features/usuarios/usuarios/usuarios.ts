import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { finalize, timer } from 'rxjs';
import { ListarUsuariosUseCase } from '../../../../application/use-cases/usuarios/listar-usuarios.use-case';
import { RegistrarUsuarioUseCase } from '../../../../application/use-cases/usuarios/registrar-usuario.use-case';
import { PAGINACION_POR_DEFECTO } from '../../../../domain/models/paginacion.model';
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
export class Usuarios implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly listarUsuarios = inject(ListarUsuariosUseCase);
  private readonly registrarUsuario = inject(RegistrarUsuarioUseCase);

  protected readonly usuarios = signal<UsuarioGestion[]>([]);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly mostrarFormulario = signal(false);
  protected readonly mensajeExito = signal<string | null>(null);
  protected readonly paginaActual = signal(PAGINACION_POR_DEFECTO.pagina);
  protected readonly tamanioPagina = signal(PAGINACION_POR_DEFECTO.tamanio);
  protected readonly totalRegistros = signal(0);

  ngOnInit(): void {
    this.cargar();
  }

  protected abrirFormulario(): void {
    this.mensajeExito.set(null);
    this.mostrarFormulario.set(true);
  }

  protected cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  protected onPaginaCambiada(evento: PageEvent): void {
    this.paginaActual.set(evento.pageIndex + 1);
    this.tamanioPagina.set(evento.pageSize);
    this.cargar();
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
        this.recargar(1);
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

  private recargar(pagina = this.paginaActual()): void {
    this.paginaActual.set(pagina);
    this.cargar(pagina);
  }

  private cargar(pagina = this.paginaActual()): void {
    this.cargando.set(true);

    this.listarUsuarios
      .ejecutar({ pagina, tamanio: this.tamanioPagina() })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (resultado) => {
          this.usuarios.set(resultado.elementos);
          this.totalRegistros.set(resultado.totalRegistros);
          this.paginaActual.set(resultado.paginaActual);
          this.tamanioPagina.set(resultado.tamanioPagina);

          if (resultado.elementos.length === 0 && resultado.totalRegistros > 0 && pagina > 1) {
            this.recargar(pagina - 1);
          }
        },
        error: () => undefined,
      });
  }
}
