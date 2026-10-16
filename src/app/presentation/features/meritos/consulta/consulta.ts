import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelect, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { CambiarEstadoFichaUseCase } from '../../../../application/use-cases/meritos/cambiar-estado-ficha.use-case';
import { ListarFichasValoracionUseCase } from '../../../../application/use-cases/meritos/listar-fichas-valoracion.use-case';
import {
  FichaResumen,
  FILTROS_CONSULTA_FICHAS_VACIOS,
  FiltrosConsultaFichas,
} from '../../../../domain/models/ficha-consulta.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { formatearFechaCorta } from '../fecha/fecha-valoracion.util';
import { soloDigitosDni } from '../registro/ficha-valoracion.util';
import { Registro } from '../registro/registro';

/**
 * RF006 - Submenú Consulta: bandeja de fichas del registrador en sesión.
 * Editar reemplaza la bandeja por la ficha de valoración cargada por id.
 */
@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTooltipModule,
    Registro,
  ],
  templateUrl: './consulta.html',
  styleUrl: './consulta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Consulta implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarFichas = inject(ListarFichasValoracionUseCase);
  private readonly cambiarEstadoFicha = inject(CambiarEstadoFichaUseCase);

  /** Valores escritos en los campos de filtro (aún no aplicados). */
  protected readonly filtrosFormulario = signal<FiltrosConsultaFichas>({
    ...FILTROS_CONSULTA_FICHAS_VACIOS,
  });
  /** Filtros con los que se consultó por última vez (se conservan al volver de editar). */
  private readonly filtrosAplicados = signal<FiltrosConsultaFichas>({
    ...FILTROS_CONSULTA_FICHAS_VACIOS,
  });

  protected readonly fichas = signal<FichaResumen[]>([]);
  protected readonly paginaActual = signal(1);
  protected readonly tamanioPagina = signal(10);
  protected readonly totalRegistros = signal(0);
  protected readonly opcionesTamanioPagina = [5, 10, 20, 50];
  protected readonly cargando = signal(false);
  protected readonly cambiandoEstadoId = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);

  /** Id de la ficha abierta en edición; `null` muestra la bandeja. */
  protected readonly fichaEnEdicion = signal<string | null>(null);

  protected readonly formatearFecha = formatearFechaCorta;

  ngOnInit(): void {
    this.cargar();
  }

  protected onFiltroCambiado(campo: keyof FiltrosConsultaFichas, valor: string): void {
    this.filtrosFormulario.update((filtros) => ({ ...filtros, [campo]: valor }));
  }

  protected onDniInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalizado = soloDigitosDni(input.value);
    if (input.value !== normalizado) {
      input.value = normalizado;
    }
    this.onFiltroCambiado('dni', normalizado);
  }

  protected onBuscar(event?: Event): void {
    event?.preventDefault();
    this.filtrosAplicados.set({ ...this.filtrosFormulario() });
    this.mensajeExito.set(null);
    this.cargar(1);
  }

  protected onLimpiar(): void {
    this.filtrosFormulario.set({ ...FILTROS_CONSULTA_FICHAS_VACIOS });
    this.onBuscar();
  }

  protected onPaginaCambiada(evento: PageEvent): void {
    this.tamanioPagina.set(evento.pageSize);
    this.cargar(evento.pageIndex + 1);
  }

  protected numeroFila(indice: number): number {
    return (this.paginaActual() - 1) * this.tamanioPagina() + indice + 1;
  }

  protected async onEstadoSeleccionado(
    ficha: FichaResumen,
    evento: MatSelectChange<boolean>
  ): Promise<void> {
    const activar = evento.value;
    if (activar === ficha.activa) {
      return;
    }

    const confirmado = await this.alertas.confirmar({
      icono: 'warning',
      titulo: activar ? 'Activar ficha' : 'Inactivar ficha',
      html: `¿Confirma que desea ${activar ? 'activar' : 'inactivar'} la ficha de <strong>${ficha.nombreCompleto}</strong> (DNI ${ficha.dni})?`,
      textoConfirmar: activar ? 'Activar' : 'Inactivar',
    });

    if (!confirmado) {
      this.revertirSeleccion(evento.source, ficha);
      return;
    }

    this.cambiandoEstadoId.set(ficha.id);
    this.cambiarEstadoFicha
      .ejecutar(ficha.id, activar)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cambiandoEstadoId.set(null))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          this.revertirSeleccion(evento.source, ficha);
          void this.alertas.error('No se pudo cambiar el estado', resultado.detalle);
          return;
        }

        this.mensajeExito.set(
          `La ficha de ${ficha.nombreCompleto} fue ${activar ? 'activada' : 'inactivada'}.`
        );
        this.cargar();
      });
  }

  protected onEditar(ficha: FichaResumen): void {
    if (!ficha.activa) {
      return;
    }
    this.mensajeExito.set(null);
    this.fichaEnEdicion.set(ficha.id);
  }

  protected onVolverDeEdicion(): void {
    this.fichaEnEdicion.set(null);
    this.cargar();
  }

  private revertirSeleccion(select: MatSelect, ficha: FichaResumen): void {
    select.value = ficha.activa;
  }

  private cargar(pagina = this.paginaActual()): void {
    const tamanio = this.tamanioPagina();
    this.cargando.set(true);

    this.listarFichas
      .ejecutar(this.filtrosAplicados(), { pagina, tamanio })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (resultado) => {
          this.fichas.set(resultado.elementos);
          this.totalRegistros.set(resultado.totalRegistros);
          this.paginaActual.set(resultado.paginaActual || pagina);

          // Si la página quedó vacía (p. ej. tras cambiar filtros), retrocede una.
          if (resultado.elementos.length === 0 && resultado.totalRegistros > 0 && pagina > 1) {
            this.cargar(pagina - 1);
          }
        },
        // El interceptor global ya notifica los errores del GET.
        error: () => {
          this.fichas.set([]);
          this.totalRegistros.set(0);
        },
      });
  }
}
