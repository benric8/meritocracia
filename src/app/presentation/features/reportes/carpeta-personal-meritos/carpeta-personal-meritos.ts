import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subject, switchMap, tap } from 'rxjs';
import { DescargarCarpetaPersonalMeritosUseCase } from '../../../../application/use-cases/reportes/descargar-carpeta-personal-meritos.use-case';
import { ObtenerCarpetaPersonalMeritosUseCase } from '../../../../application/use-cases/reportes/obtener-carpeta-personal-meritos.use-case';
import { CarpetaPersonalMeritos as CarpetaPersonalMeritosModelo } from '../../../../domain/models/carpeta-personal-meritos.model';
import { DetalleError } from '../../../../domain/models/detalle-error.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { BusquedaFichas } from '../busqueda-fichas/busqueda-fichas';
import { guardarArchivoDescargado } from '../guardar-archivo.util';
import { CarpetaMeritosVista } from './vista/carpeta-meritos-vista';

/** N017: la ficha no existe o está inactiva. */
const CODIGO_FICHA_NO_ENCONTRADA = 'N017';

/** Ficha abierta: la elegida en la búsqueda o la que llega por `?ficha=`. */
interface CarpetaSeleccionada {
  idFicha: string;
  nombre: string;
}

/**
 * RF007 - Submenú F: Carpeta Personal de Méritos (Anexo 05).
 * Se busca la ficha (`GET /fichas`) y se muestran todos sus documentos, rubro por rubro,
 * con las tablas tal como las arma el backend.
 */
@Component({
  selector: 'app-carpeta-personal-meritos',
  standalone: true,
  imports: [BusquedaFichas, CarpetaMeritosVista],
  templateUrl: './carpeta-personal-meritos.html',
  styleUrl: './carpeta-personal-meritos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarpetaPersonalMeritos implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly obtenerCarpeta = inject(ObtenerCarpetaPersonalMeritosUseCase);
  private readonly descargarCarpeta = inject(DescargarCarpetaPersonalMeritosUseCase);

  private readonly busqueda = viewChild.required(BusquedaFichas);

  /** Cada consulta cancela la anterior: se muestra siempre la última carpeta pedida. */
  private readonly consultas = new Subject<string>();

  /** `null` muestra la búsqueda. */
  protected readonly seleccionada = signal<CarpetaSeleccionada | null>(null);
  protected readonly carpeta = signal<CarpetaPersonalMeritosModelo | null>(null);
  protected readonly error = signal<DetalleError | null>(null);
  protected readonly cargando = signal(false);
  protected readonly descargando = signal(false);

  constructor() {
    this.consultas
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.error.set(null);
          this.carpeta.set(null);
        }),
        switchMap((idFicha) => this.obtenerCarpeta.ejecutar(idFicha)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((resultado) => {
        this.cargando.set(false);
        if (resultado.exito) {
          this.carpeta.set(resultado.carpeta);
          return;
        }
        if (resultado.detalle.codigo === CODIGO_FICHA_NO_ENCONTRADA) {
          // La ficha ya no existe o se inactivó: se vuelve a la búsqueda actualizada.
          void this.alertas.error('Ficha no disponible', resultado.detalle);
          this.onVolver();
          return;
        }
        this.error.set(resultado.detalle);
      });
  }

  ngOnInit(): void {
    // Desde la Ficha de Valoración de Méritos se llega con la ficha ya elegida.
    const idFicha = this.route.snapshot.queryParamMap.get('ficha')?.trim();
    if (idFicha) {
      this.abrir({ idFicha, nombre: '' });
    }
  }

  protected onVerCarpeta(resumen: { id: string; nombreCompleto: string }): void {
    this.abrir({ idFicha: resumen.id, nombre: resumen.nombreCompleto });
  }

  protected onReintentar(): void {
    const seleccionada = this.seleccionada();
    if (seleccionada) {
      this.consultas.next(seleccionada.idFicha);
    }
  }

  protected onVolver(): void {
    this.seleccionada.set(null);
    this.carpeta.set(null);
    this.error.set(null);
    if (this.route.snapshot.queryParamMap.has('ficha')) {
      void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
    }
    this.busqueda().recargar();
  }

  protected onDescargarPdf(): void {
    const idFicha = this.carpeta()?.idFicha || this.seleccionada()?.idFicha;
    if (!idFicha || !this.carpeta() || this.descargando()) {
      return;
    }
    this.descargando.set(true);

    this.descargarCarpeta
      .ejecutar(idFicha)
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

  private abrir(seleccionada: CarpetaSeleccionada): void {
    this.seleccionada.set(seleccionada);
    this.consultas.next(seleccionada.idFicha);
  }
}
