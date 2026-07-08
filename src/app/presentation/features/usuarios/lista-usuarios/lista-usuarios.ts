import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PAGINACION_POR_DEFECTO } from '../../../../domain/models/paginacion.model';
import { UsuarioGestion } from '../models/usuario-gestion.model';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
  templateUrl: './lista-usuarios.html',
  styleUrl: './lista-usuarios.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaUsuarios {
  readonly usuarios = input<UsuarioGestion[]>([]);
  readonly cargando = input(false);

  readonly restablecerClave = output<UsuarioGestion>();
  readonly cambiarEstado = output<UsuarioGestion>();

  protected readonly terminoBusqueda = signal('');
  protected readonly paginaActual = signal(PAGINACION_POR_DEFECTO.pagina);
  protected readonly tamanioPagina = signal(PAGINACION_POR_DEFECTO.tamanio);
  protected readonly opcionesTamanioPagina = [5, 8, 10, 20];

  protected readonly usuariosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().trim().toLowerCase();
    const lista = this.usuarios();

    if (!termino) {
      return lista;
    }

    return lista.filter(
      (usuario) =>
        usuario.nombreCompleto.toLowerCase().includes(termino) ||
        usuario.codigo.toLowerCase().includes(termino) ||
        usuario.dependencia.toLowerCase().includes(termino) ||
        usuario.cargo.toLowerCase().includes(termino) ||
        usuario.funcion.toLowerCase().includes(termino)
    );
  });

  protected readonly usuariosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanioPagina();
    return this.usuariosFiltrados().slice(inicio, inicio + this.tamanioPagina());
  });

  protected readonly totalRegistros = computed(() => this.usuariosFiltrados().length);

  protected onBusquedaCambiada(valor: string): void {
    this.terminoBusqueda.set(valor);
    this.paginaActual.set(1);
  }

  protected onPaginaCambiada(evento: PageEvent): void {
    this.paginaActual.set(evento.pageIndex + 1);
    this.tamanioPagina.set(evento.pageSize);
  }

  protected numeroFila(indice: number): number {
    return (this.paginaActual() - 1) * this.tamanioPagina() + indice + 1;
  }

  protected etiquetaEstado(habilitado: boolean): string {
    return habilitado ? 'Habilitado' : 'Deshabilitado';
  }

  protected tituloAccionEstado(habilitado: boolean): string {
    return habilitado ? 'Deshabilitar usuario' : 'Habilitar usuario';
  }

  protected iconoAccionEstado(habilitado: boolean): string {
    return habilitado ? 'pause_circle' : 'play_circle';
  }
}
