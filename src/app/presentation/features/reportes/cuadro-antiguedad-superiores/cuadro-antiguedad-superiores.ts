import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize, Subject, switchMap, tap } from 'rxjs';
import { DescargarCuadroAntiguedadSuperioresUseCase } from '../../../../application/use-cases/reportes/descargar-cuadro-antiguedad-superiores.use-case';
import { ListarCatalogosDashboardUseCase } from '../../../../application/use-cases/reportes/listar-catalogos-dashboard.use-case';
import { ListarFechasValoracionReporteUseCase } from '../../../../application/use-cases/reportes/listar-fechas-valoracion-reporte.use-case';
import { ObtenerCuadroAntiguedadSuperioresUseCase } from '../../../../application/use-cases/reportes/obtener-cuadro-antiguedad-superiores.use-case';
import { CatalogoItem } from '../../../../domain/models/catalogo-item.model';
import {
  CuadroAntiguedadSuperiores as CuadroAntiguedadSuperioresModelo,
  FILTROS_CUADRO_ANTIGUEDAD_SUPERIORES_VACIOS,
  FiltrosCuadroAntiguedadSuperiores,
} from '../../../../domain/models/cuadro-antiguedad-superiores.model';
import { DetalleError } from '../../../../domain/models/detalle-error.model';
import { FechaValoracion } from '../../../../domain/models/fecha-valoracion.model';
import {
  ArchivoDescargado,
  FormatoDescargaCuadro,
} from '../../../../domain/models/reporte-descarga.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { formatearFechaCuadro } from '../cuadro-antiguedad-supremos/cuadro-antiguedad.util';
import { aFilaCuadroAntiguedadSuperioresVista } from './cuadro-antiguedad-superiores.util';

/** N015: no existe la fecha de valoración enviada o no hay una activa. */
const CODIGO_FECHA_NO_ENCONTRADA = 'N015';

/**
 * RF007 - Submenú D: Cuadro de Antigüedad de Jueces Superiores Titulares (Anexo 03).
 * El backend ordena por precedencia y asigna el N° de orden: con una Corte filtrada
 * `orden` empieza en 1 y `ordenNacional` trae la posición nacional (sin ordenar por columna).
 */
@Component({
  selector: 'app-cuadro-antiguedad-superiores',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './cuadro-antiguedad-superiores.html',
  styleUrl: './cuadro-antiguedad-superiores.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuadroAntiguedadSuperiores implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarFechas = inject(ListarFechasValoracionReporteUseCase);
  private readonly listarCatalogos = inject(ListarCatalogosDashboardUseCase);
  private readonly obtenerCuadro = inject(ObtenerCuadroAntiguedadSuperioresUseCase);
  private readonly descargarCuadro = inject(DescargarCuadroAntiguedadSuperioresUseCase);

  /** Cada búsqueda cancela la anterior: el cuadro siempre es de los últimos filtros. */
  private readonly consultas = new Subject<FiltrosCuadroAntiguedadSuperiores>();

  protected readonly opcionesTamanioPagina = [25, 50, 100];

  protected readonly fechas = signal<FechaValoracion[]>([]);
  protected readonly idVigente = signal<string | null>(null);
  protected readonly distritos = signal<CatalogoItem[]>([]);

  /** Valores elegidos en el formulario (aún no buscados). */
  protected readonly filtrosFormulario = signal<FiltrosCuadroAntiguedadSuperiores>({
    ...FILTROS_CUADRO_ANTIGUEDAD_SUPERIORES_VACIOS,
  });
  /** Filtros de la última búsqueda: los usan el subtítulo y las descargas. */
  private readonly filtrosAplicados = signal<FiltrosCuadroAntiguedadSuperiores>({
    ...FILTROS_CUADRO_ANTIGUEDAD_SUPERIORES_VACIOS,
  });

  protected readonly cuadro = signal<CuadroAntiguedadSuperioresModelo | null>(null);
  protected readonly error = signal<DetalleError | null>(null);
  protected readonly cargando = signal(true);
  protected readonly descargando = signal<FormatoDescargaCuadro | null>(null);
  protected readonly paginaActual = signal(0);
  protected readonly tamanioPagina = signal(25);

  protected readonly hayCambiosPendientes = computed(() => {
    const formulario = this.filtrosFormulario();
    const aplicados = this.filtrosAplicados();
    return (
      formulario.idFechaValoracion !== aplicados.idFechaValoracion ||
      formulario.idDistritoJudicial !== aplicados.idDistritoJudicial
    );
  });
  protected readonly errorDeFecha = computed(
    () => this.error()?.codigo === CODIGO_FECHA_NO_ENCONTRADA
  );

  /** Con una Corte filtrada el orden es local: el nacional va en el tooltip. */
  protected readonly porCorte = computed(() => !!this.filtrosAplicados().idDistritoJudicial);
  protected readonly filas = computed(() =>
    (this.cuadro()?.filas ?? []).map(aFilaCuadroAntiguedadSuperioresVista)
  );
  /** Paginación en el front: el endpoint devuelve todas las filas. */
  protected readonly filasPagina = computed(() => {
    const inicio = this.paginaActual() * this.tamanioPagina();
    return this.filas().slice(inicio, inicio + this.tamanioPagina());
  });
  /** Igual que el PDF: "dd/mm/aaaa - Nivel nacional" o "- Corte Superior de Justicia de X". */
  protected readonly encabezado = computed(() => {
    const cuadro = this.cuadro();
    if (!cuadro) {
      return null;
    }
    const idDistrito = this.filtrosAplicados().idDistritoJudicial;
    // Sin filas el backend no manda el nombre: se toma de la opción elegida.
    const corte =
      cuadro.distritoJudicial ??
      this.distritos().find((distrito) => distrito.id === idDistrito)?.nombre ??
      '';
    return {
      fecha: formatearFechaCuadro(cuadro.fechaValoracion),
      ambito: idDistrito ? `Corte Superior de Justicia de ${corte}` : 'Nivel nacional',
    };
  });
  protected readonly notas = computed(() => {
    const cuadro = this.cuadro();
    return cuadro
      ? [cuadro.notaCesantes, cuadro.notaDistrito, cuadro.notaProvisional].filter(
          (nota): nota is string => !!nota
        )
      : [];
  });
  protected readonly descargasDeshabilitadas = computed(
    () => this.cargando() || !!this.descargando() || this.filas().length === 0
  );

  constructor() {
    this.consultas
      .pipe(
        tap((filtros) => {
          this.cargando.set(true);
          this.error.set(null);
          this.filtrosAplicados.set(filtros);
        }),
        switchMap((filtros) => this.obtenerCuadro.ejecutar(filtros)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((resultado) => {
        this.cargando.set(false);
        this.paginaActual.set(0);
        if (resultado.exito) {
          this.cuadro.set(resultado.cuadro);
          return;
        }
        this.cuadro.set(null);
        this.error.set(resultado.detalle);
      });
  }

  ngOnInit(): void {
    this.listarCatalogos
      .ejecutar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudieron cargar las Cortes Superiores', resultado.detalle);
          return;
        }
        this.distritos.set(resultado.catalogos.distritosJudiciales);
      });

    this.listarFechas
      .ejecutar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resultado) => {
        if (resultado.exito) {
          this.fechas.set(resultado.fechas);
          this.idVigente.set(resultado.idVigente);
        } else {
          void this.alertas.error('No se pudieron cargar las fechas de valoración', resultado.detalle);
        }
        // Cuadro nacional; sin fecha elegida el backend usa la fecha de valoración activa.
        this.filtrosFormulario.set(this.filtrosIniciales());
        this.consultas.next(this.filtrosIniciales());
      });
  }

  protected onFiltroCambiado(
    campo: keyof FiltrosCuadroAntiguedadSuperiores,
    valor: string | null
  ): void {
    this.filtrosFormulario.update((filtros) => ({ ...filtros, [campo]: valor ?? '' }));
  }

  protected onBuscar(evento?: Event): void {
    evento?.preventDefault();
    this.consultas.next({ ...this.filtrosFormulario() });
  }

  protected onLimpiar(): void {
    this.filtrosFormulario.set(this.filtrosIniciales());
    this.consultas.next(this.filtrosIniciales());
  }

  protected onReintentar(): void {
    this.consultas.next(this.filtrosAplicados());
  }

  protected onPaginaCambiada(evento: PageEvent): void {
    this.paginaActual.set(evento.pageIndex);
    this.tamanioPagina.set(evento.pageSize);
  }

  protected onDescargar(formato: FormatoDescargaCuadro): void {
    if (this.descargasDeshabilitadas()) {
      return;
    }
    // Filtros de la última búsqueda (no lo elegido y aún no buscado) y la fecha del cuadro.
    const filtros: FiltrosCuadroAntiguedadSuperiores = {
      ...this.filtrosAplicados(),
      idFechaValoracion:
        this.filtrosAplicados().idFechaValoracion || this.cuadro()?.idFechaValoracion || '',
    };
    this.descargando.set(formato);

    this.descargarCuadro
      .ejecutar(formato, filtros)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.descargando.set(null))
      )
      .subscribe((resultado) => {
        if (resultado.exito) {
          this.guardarArchivo(resultado.archivo);
          return;
        }
        void this.alertas.error('No se pudo descargar el archivo', resultado.detalle);
      });
  }

  protected etiquetaFecha(fecha: FechaValoracion): string {
    return formatearFechaCuadro(fecha.fechaValoracion);
  }

  private filtrosIniciales(): FiltrosCuadroAntiguedadSuperiores {
    return {
      ...FILTROS_CUADRO_ANTIGUEDAD_SUPERIORES_VACIOS,
      idFechaValoracion: this.idVigente() ?? '',
    };
  }

  private guardarArchivo({ nombre, contenido }: ArchivoDescargado): void {
    const url = URL.createObjectURL(contenido);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
