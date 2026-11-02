import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CarpetaPersonalMeritos } from '../../../../../domain/models/carpeta-personal-meritos.model';
import { DetalleError } from '../../../../../domain/models/detalle-error.model';
import { carpetaVista } from '../carpeta-personal-meritos.util';

/** N015: la fecha de valoración de la ficha ya no existe (no se ofrece reintentar). */
const CODIGO_FECHA_NO_ENCONTRADA = 'N015';

/**
 * Vista web de la Carpeta Personal de Méritos (Anexo 05), con la paleta de la app.
 * Solo presenta: la carga y la descarga las hace el padre.
 */
@Component({
  selector: 'app-carpeta-meritos-vista',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './carpeta-meritos-vista.html',
  styleUrl: './carpeta-meritos-vista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarpetaMeritosVista {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly carpeta = input<CarpetaPersonalMeritos | null>(null);
  readonly error = input<DetalleError | null>(null);
  readonly cargando = input(false);
  readonly descargando = input(false);
  /** Nombre de la ficha elegida, para el mensaje de carga (vacío si llega por URL). */
  readonly nombre = input('');

  readonly volver = output<void>();
  readonly descargarPdf = output<void>();
  readonly reintentar = output<void>();

  protected readonly vista = computed(() => {
    const carpeta = this.carpeta();
    return carpeta ? carpetaVista(carpeta) : null;
  });
  protected readonly errorDeFecha = computed(
    () => this.error()?.codigo === CODIGO_FECHA_NO_ENCONTRADA
  );

  constructor() {
    // Se abre desde un listado que puede estar desplazado: la carpeta empieza arriba.
    afterNextRender(() => this.host.nativeElement.scrollIntoView?.({ block: 'start' }));
  }

  /** Índice de rubros: lleva al rubro sin cambiar la URL. */
  protected onIrARubro(id: string): void {
    this.host.nativeElement
      .querySelector(`[id="${id}"]`)
      ?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  protected onImprimir(): void {
    window.print();
  }
}
