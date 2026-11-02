import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
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
import { finalize } from 'rxjs';
import { BuscarFichasReporteUseCase } from '../../../../application/use-cases/reportes/buscar-fichas-reporte.use-case';
import {
  FichaResumen,
  FILTROS_CONSULTA_FICHAS_VACIOS,
  FiltrosConsultaFichas,
} from '../../../../domain/models/ficha-consulta.model';
import { formatearFechaCuadro } from '../cuadro-antiguedad-supremos/cuadro-antiguedad.util';

/** Máximo de `apellidos` y `nombres` que acepta `GET /fichas`. */
const TEXTO_BUSQUEDA_MAX_LENGTH = 100;

/**
 * Búsqueda de fichas de los reportes por ficha (Anexos 04 y 05): `GET /fichas` sin
 * limitar al registrador, paginada. El padre decide qué abrir con la ficha elegida.
 */
@Component({
  selector: 'app-busqueda-fichas',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './busqueda-fichas.html',
  styleUrl: './busqueda-fichas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusquedaFichas implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly buscarFichas = inject(BuscarFichasReporteUseCase);

  /** Etiqueta del anexo en la cabecera, p. ej. "Anexo 04". */
  readonly anexo = input.required<string>();
  readonly titulo = input.required<string>();
  /** Texto e ícono del botón de cada resultado. */
  readonly accion = input('Ver ficha');
  readonly icono = input('visibility');

  readonly seleccionar = output<FichaResumen>();

  protected readonly textoMaxLength = TEXTO_BUSQUEDA_MAX_LENGTH;
  protected readonly opcionesTamanioPagina = [10, 20, 50];
  protected readonly formatearFecha = formatearFechaCuadro;

  protected readonly filtrosFormulario = signal<FiltrosConsultaFichas>({
    ...FILTROS_CONSULTA_FICHAS_VACIOS,
  });
  /** Filtros de la última búsqueda (se conservan al volver del reporte). */
  private readonly filtrosAplicados = signal<FiltrosConsultaFichas>({
    ...FILTROS_CONSULTA_FICHAS_VACIOS,
  });
  protected readonly resultados = signal<FichaResumen[]>([]);
  protected readonly totalRegistros = signal(0);
  protected readonly paginaActual = signal(1);
  protected readonly tamanioPagina = signal(10);
  protected readonly buscando = signal(false);

  ngOnInit(): void {
    this.buscar(1);
  }

  /** Repite la última búsqueda en la página actual (al volver del reporte). */
  recargar(): void {
    this.buscar();
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

  protected onSeleccionar(resumen: FichaResumen): void {
    if (resumen.activa) {
      this.seleccionar.emit(resumen);
    }
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
