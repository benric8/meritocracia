import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize, Subject, switchMap, tap } from 'rxjs';
import { DescargarFichaValoracionMeritosUseCase } from '../../../../application/use-cases/reportes/descargar-ficha-valoracion-meritos.use-case';
import { ObtenerFichaValoracionMeritosUseCase } from '../../../../application/use-cases/reportes/obtener-ficha-valoracion-meritos.use-case';
import { DetalleError } from '../../../../domain/models/detalle-error.model';
import { FichaResumen } from '../../../../domain/models/ficha-consulta.model';
import { FichaValoracionMeritos as FichaValoracionMeritosModelo } from '../../../../domain/models/ficha-valoracion-meritos.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { BusquedaFichas } from '../busqueda-fichas/busqueda-fichas';
import { RUTA_CARPETA_PERSONAL } from '../carpeta-personal-meritos/carpeta-personal-meritos.util';
import { guardarArchivoDescargado } from '../guardar-archivo.util';
import { FichaMeritosVista } from './vista/ficha-meritos-vista';

/** N017: la ficha no existe o está inactiva. */
const CODIGO_FICHA_NO_ENCONTRADA = 'N017';

/**
 * RF007 - Submenú E: Ficha de Valoración de Méritos (Anexo 04).
 * Primero se busca la ficha (`GET /fichas`, sin limitar al registrador) y luego se
 * muestra tal como la arma el backend: rubros, subrubros, indicadores y puntajes.
 */
@Component({
  selector: 'app-ficha-valoracion-meritos',
  standalone: true,
  imports: [BusquedaFichas, FichaMeritosVista],
  templateUrl: './ficha-valoracion-meritos.html',
  styleUrl: './ficha-valoracion-meritos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FichaValoracionMeritos {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly obtenerFicha = inject(ObtenerFichaValoracionMeritosUseCase);
  private readonly descargarFicha = inject(DescargarFichaValoracionMeritosUseCase);

  private readonly busqueda = viewChild.required(BusquedaFichas);

  /** Cada consulta cancela la anterior: se muestra siempre la última ficha pedida. */
  private readonly consultasFicha = new Subject<string>();

  /** Ficha elegida en los resultados; `null` muestra la búsqueda. */
  protected readonly fichaSeleccionada = signal<FichaResumen | null>(null);
  protected readonly ficha = signal<FichaValoracionMeritosModelo | null>(null);
  protected readonly errorFicha = signal<DetalleError | null>(null);
  protected readonly cargandoFicha = signal(false);
  protected readonly descargando = signal(false);

  constructor() {
    this.consultasFicha
      .pipe(
        tap(() => {
          this.cargandoFicha.set(true);
          this.errorFicha.set(null);
          this.ficha.set(null);
        }),
        switchMap((idFicha) => this.obtenerFicha.ejecutar(idFicha)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((resultado) => {
        this.cargandoFicha.set(false);
        if (resultado.exito) {
          this.ficha.set(resultado.ficha);
          return;
        }
        if (resultado.detalle.codigo === CODIGO_FICHA_NO_ENCONTRADA) {
          // La ficha ya no existe o se inactivó: se vuelve a la búsqueda actualizada.
          void this.alertas.error('Ficha no disponible', resultado.detalle);
          this.onVolver();
          return;
        }
        this.errorFicha.set(resultado.detalle);
      });
  }

  protected onVerFicha(resumen: FichaResumen): void {
    this.fichaSeleccionada.set(resumen);
    this.consultasFicha.next(resumen.id);
  }

  protected onReintentar(): void {
    const seleccionada = this.fichaSeleccionada();
    if (seleccionada) {
      this.consultasFicha.next(seleccionada.id);
    }
  }

  protected onVolver(): void {
    this.fichaSeleccionada.set(null);
    this.ficha.set(null);
    this.errorFicha.set(null);
    this.busqueda().recargar();
  }

  /** Abre la Carpeta Personal (Anexo 05) de la misma ficha, sin buscarla de nuevo. */
  protected onVerCarpeta(): void {
    const idFicha = this.idFichaActual();
    if (idFicha) {
      void this.router.navigate([RUTA_CARPETA_PERSONAL], { queryParams: { ficha: idFicha } });
    }
  }

  protected onDescargarPdf(): void {
    if (!this.ficha() || this.descargando()) {
      return;
    }
    this.descargando.set(true);

    this.descargarFicha
      .ejecutar(this.idFichaActual())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.descargando.set(false))
      )
      .subscribe((resultado) => {
        if (resultado.exito) {
          guardarArchivoDescargado(resultado.archivo);
          return;
        }
        void this.alertas.error('No se pudo descargar el PDF', resultado.detalle);
      });
  }

  private idFichaActual(): string {
    return this.ficha()?.idFicha || this.fichaSeleccionada()?.id || '';
  }
}
