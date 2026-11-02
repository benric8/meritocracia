import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DetalleError } from '../../../../../domain/models/detalle-error.model';
import { FichaValoracionMeritos } from '../../../../../domain/models/ficha-valoracion-meritos.model';
import { FactorVista, fichaVista } from '../ficha-valoracion-meritos.util';

/** N015: la fecha de valoración de la ficha ya no existe (no se ofrece reintentar). */
const CODIGO_FECHA_NO_ENCONTRADA = 'N015';

/**
 * Vista web de la Ficha de Valoración de Méritos (Anexo 04), con la paleta de la app.
 * Solo presenta: la carga y la descarga las hace el padre.
 */
@Component({
  selector: 'app-ficha-meritos-vista',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './ficha-meritos-vista.html',
  styleUrl: './ficha-meritos-vista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FichaMeritosVista {
  readonly ficha = input<FichaValoracionMeritos | null>(null);
  readonly error = input<DetalleError | null>(null);
  readonly cargando = input(false);
  readonly descargando = input(false);
  /** Nombre de la ficha elegida, para el mensaje de carga. */
  readonly nombre = input('');

  readonly volver = output<void>();
  readonly descargarPdf = output<void>();
  readonly reintentar = output<void>();

  protected readonly vista = computed(() => {
    const ficha = this.ficha();
    return ficha ? fichaVista(ficha) : null;
  });
  protected readonly errorDeFecha = computed(
    () => this.error()?.codigo === CODIGO_FECHA_NO_ENCONTRADA
  );
  /** Factores con las filas sin puntaje desplegadas (por defecto van plegadas). */
  private readonly desplegados = signal<ReadonlySet<string>>(new Set());

  constructor() {
    // Se abre desde un listado que puede estar desplazado: la ficha empieza arriba.
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    afterNextRender(() => host.nativeElement.scrollIntoView?.({ block: 'start' }));
  }

  protected muestraSinPuntaje(factor: FactorVista): boolean {
    return this.desplegados().has(factor.numero);
  }

  protected onAlternarSinPuntaje(factor: FactorVista): void {
    this.desplegados.update((desplegados) => {
      const siguiente = new Set(desplegados);
      if (!siguiente.delete(factor.numero)) {
        siguiente.add(factor.numero);
      }
      return siguiente;
    });
  }

  protected onImprimir(): void {
    window.print();
  }
}
