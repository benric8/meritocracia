import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ListarUsuariosUseCase } from '../../../../application/use-cases/usuarios/listar-usuarios.use-case';
import { PAGINACION_POR_DEFECTO } from '../../../../domain/models/paginacion.model';
import { UsuarioGestion } from '../../../../domain/models/usuario-gestion.model';

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
export class ListaUsuarios implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly listarUsuarios = inject(ListarUsuariosUseCase);

  readonly restablecerClave = output<UsuarioGestion>();
  readonly cambiarEstado = output<UsuarioGestion>();

  protected readonly usuarios = signal<UsuarioGestion[]>([]);
  protected readonly paginaActual = signal(PAGINACION_POR_DEFECTO.pagina);
  protected readonly tamanioPagina = signal(PAGINACION_POR_DEFECTO.tamanio);
  protected readonly totalRegistros = signal(0);
  protected readonly opcionesTamanioPagina = [5, 8, 10, 20];
  protected readonly cargando = signal(false);
  protected readonly terminoBusqueda = signal('');

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

  protected readonly totalRegistrosVisibles = computed(() =>
    this.terminoBusqueda().trim() ? this.usuariosFiltrados().length : this.totalRegistros()
  );

  ngOnInit(): void {
    this.cargar();
  }

  recargar(pagina = this.paginaActual()): void {
    this.paginaActual.set(pagina);
    this.cargar(pagina);
  }

  protected onBusquedaCambiada(valor: string): void {
    this.terminoBusqueda.set(valor);
  }

  protected onPaginaCambiada(evento: PageEvent): void {
    this.paginaActual.set(evento.pageIndex + 1);
    this.tamanioPagina.set(evento.pageSize);
    this.cargar();
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

  private cargar(pagina = this.paginaActual()): void {
    const tamanio = this.tamanioPagina();
    this.cargando.set(true);

    this.listarUsuarios
      .ejecutar({ pagina, tamanio })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (resultado) => {
          this.usuarios.set(resultado.elementos);
          this.totalRegistros.set(resultado.totalRegistros);
          this.paginaActual.set(resultado.paginaActual);
          this.tamanioPagina.set(tamanio);

          if (resultado.elementos.length === 0 && resultado.totalRegistros > 0 && pagina > 1) {
            this.recargar(pagina - 1);
          }
        },
        error: () => undefined,
      });
  }
}
