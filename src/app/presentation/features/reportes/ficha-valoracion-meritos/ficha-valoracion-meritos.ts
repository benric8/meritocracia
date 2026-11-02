import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize, Subject, switchMap, tap } from 'rxjs';
import { BuscarFichasReporteUseCase } from '../../../../application/use-cases/reportes/buscar-fichas-reporte.use-case';
import { DescargarFichaValoracionMeritosUseCase } from '../../../../application/use-cases/reportes/descargar-ficha-valoracion-meritos.use-case';
import { ObtenerFichaValoracionMeritosUseCase } from '../../../../application/use-cases/reportes/obtener-ficha-valoracion-meritos.use-case';
import { DetalleError } from '../../../../domain/models/detalle-error.model';
import {
  FichaResumen,
  FILTROS_CONSULTA_FICHAS_VACIOS,
  FiltrosConsultaFichas,
} from '../../../../domain/models/ficha-consulta.model';
import { FichaValoracionMeritos as FichaValoracionMeritosModelo } from '../../../../domain/models/ficha-valoracion-meritos.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { formatearFechaCuadro } from '../cuadro-antiguedad-supremos/cuadro-antiguedad.util';
import { guardarArchivoDescargado } from '../guardar-archivo.util';
import { FichaMeritosVista } from './vista/ficha-meritos-vista';

/** N017: la ficha no existe o está inactiva. */
const CODIGO_FICHA_NO_ENCONTRADA = 'N017';
/** Máximo de `apellidos` y `nombres` que acepta `GET /fichas`. */
const TEXTO_BUSQUEDA_MAX_LENGTH = 100;

/**
 * RF007 - Submenú E: Ficha de Valoración de Méritos (Anexo 04).
 * Primero se busca la ficha (`GET /fichas`, sin limitar al registrador) y luego se
 * muestra tal como la arma el backend: rubros, subrubros, indicadores y puntajes.
 */
@Component({
  selector: 'app-ficha-valoracion-meritos',
  standalone: true,
  imports: [
    FichaMeritosVista,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './ficha-valoracion-meritos.html',
  styleUrl: './ficha-valoracion-meritos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FichaValoracionMeritos implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly buscarFichas = inject(BuscarFichasReporteUseCase);
  private readonly obtenerFicha = inject(ObtenerFichaValoracionMeritosUseCase);
  private readonly descargarFicha = inject(DescargarFichaValoracionMeritosUseCase);

  /** Cada consulta cancela la anterior: se muestra siempre la última ficha pedida. */
  private readonly consultasFicha = new Subject<string>();

  protected readonly textoMaxLength = TEXTO_BUSQUEDA_MAX_LENGTH;
  protected readonly opcionesTamanioPagina = [10, 20, 50];
  protected readonly formatearFecha = formatearFechaCuadro;

  // --- Búsqueda ---
  protected readonly filtrosFormulario = signal<FiltrosConsultaFichas>({
    ...FILTROS_CONSULTA_FICHAS_VACIOS,
  });
  /** Filtros de la última búsqueda (se conservan al volver de la ficha). */
  private readonly filtrosAplicados = signal<FiltrosConsultaFichas>({
    ...FILTROS_CONSULTA_FICHAS_VACIOS,
  });
  protected readonly resultados = signal<FichaResumen[]>([]);
  protected readonly totalRegistros = signal(0);
  protected readonly paginaActual = signal(1);
  protected readonly tamanioPagina = signal(10);
  protected readonly buscando = signal(false);

  // --- Ficha ---
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

  ngOnInit(): void {
    this.buscar(1);
  }

  protected onFiltroCambiado(campo: keyof FiltrosConsultaFichas, evento: Event): void {
    const input = evento.target as HTMLInputElement;
    // El DNI solo admite dígitos (hasta 8, coincidencia inicial).
    const valor = campo === 'dni' ? input.value.replace(/\D/g, '').slice(0, 8) : input.value;
    if (input.value !== valor) {
      input.value = valor;
    }
    this.filtrosFormulario.update((filtros) => ({ ...filtros, [campo]: valor }));
  }

  protected onBuscar(evento?: Event): void {
    evento?.preventDefault();
    this.filtrosAplicados.set({ ...this.filtrosFormulario() });
    this.buscar(1);
  }

  protected onLimpiar(): void {
    this.filtrosFormulario.set({ ...FILTROS_CONSULTA_FICHAS_VACIOS });
    this.onBuscar();
  }

  protected onPaginaCambiada(evento: PageEvent): void {
    this.tamanioPagina.set(evento.pageSize);
    this.buscar(evento.pageIndex + 1);
  }

  protected onVerFicha(resumen: FichaResumen): void {
    if (!resumen.activa) {
      return;
    }
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
    this.buscar();
  }

  protected onDescargarPdf(): void {
    const ficha = this.ficha();
    if (!ficha || this.descargando()) {
      return;
    }
    this.descargando.set(true);

    this.descargarFicha
      .ejecutar(ficha.idFicha || this.fichaSeleccionada()?.id || '')
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

  private buscar(pagina = this.paginaActual()): void {
    this.buscando.set(true);

    this.buscarFichas
      .ejecutar(this.filtrosAplicados(), { pagina, tamanio: this.tamanioPagina() })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.buscando.set(false))
      )
      .subscribe({
        next: (resultado) => {
          this.resultados.set(resultado.elementos);
          this.totalRegistros.set(resultado.totalRegistros);
          this.paginaActual.set(resultado.paginaActual || pagina);
        },
        // El interceptor global ya notifica los errores de GET /fichas.
        error: () => {
          this.resultados.set([]);
          this.totalRegistros.set(0);
        },
      });
  }
}
