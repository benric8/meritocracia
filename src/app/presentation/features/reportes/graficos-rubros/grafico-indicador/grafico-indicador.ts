import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  IndicadorDashboard,
  IndicadorDashboardRubro,
} from '../../../../../domain/models/dashboard-rubros.model';
import { aSerieGrafico, BarraGrafico, SerieGrafico } from './grafico-indicador.util';

/** Anchos fijos del esqueleto de carga (evita saltos de layout). */
const ANCHOS_ESQUELETO = [92, 68, 54, 37, 22];

/**
 * Tarjeta de un indicador del dashboard: una serie = un bloque de barras horizontales.
 * Las barras usan un solo tono (magnitud); la identidad la da la etiqueta de cada fila.
 */
@Component({
  selector: 'app-grafico-indicador',
  standalone: true,
  imports: [DecimalPipe, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './grafico-indicador.html',
  styleUrl: './grafico-indicador.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficoIndicador {
  readonly clave = input<IndicadorDashboardRubro>();
  readonly titulo = input.required<string>();
  readonly indicador = input<IndicadorDashboard | null>(null);
  readonly cargando = input(false);
  /** Reparte las barras en columnas (listas largas como distrito judicial). */
  readonly enColumnas = input(false);
  /** Mensaje de error del indicador; reemplaza el gráfico. */
  readonly error = input<string | null>(null);

  readonly reintentar = output<void>();

  protected readonly anchosEsqueleto = ANCHOS_ESQUELETO;
  protected readonly vistaTabla = signal(false);

  protected readonly series = computed(() =>
    (this.indicador()?.series ?? []).map((serie) => aSerieGrafico(serie, this.clave()))
  );
  protected readonly sinDatos = computed(() =>
    this.series().every((serie) => serie.barras.length === 0)
  );

  protected alternarVista(): void {
    this.vistaTabla.update((tabla) => !tabla);
  }

  protected textoTooltip(barra: BarraGrafico, serie: SerieGrafico): string {
    const unidad = barra.cantidad === 1 ? serie.unidad.slice(0, -1) : serie.unidad;
    return `${barra.etiqueta}: ${barra.cantidad} ${unidad} (${barra.porcentaje.toFixed(2)} %)`;
  }
}
