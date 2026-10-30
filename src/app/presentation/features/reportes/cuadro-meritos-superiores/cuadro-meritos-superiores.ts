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
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize, Subject, switchMap, tap } from 'rxjs';
import { DescargarCuadroMeritosUseCase } from '../../../../application/use-cases/reportes/descargar-cuadro-meritos.use-case';
import { ListarCatalogosDashboardUseCase } from '../../../../application/use-cases/reportes/listar-catalogos-dashboard.use-case';
import { ListarFechasValoracionReporteUseCase } from '../../../../application/use-cases/reportes/listar-fechas-valoracion-reporte.use-case';
import { ObtenerCuadroMeritosUseCase } from '../../../../application/use-cases/reportes/obtener-cuadro-meritos.use-case';
import { CatalogoItem } from '../../../../domain/models/catalogo-item.model';
import {
  APELLIDOS_NOMBRES_MAX_LENGTH,
  CuadroMeritos,
  DNI_CUADRO_MERITOS_PATRON,
  FILTROS_CUADRO_MERITOS_VACIOS,
  FiltrosCuadroMeritos,
} from '../../../../domain/models/cuadro-meritos.model';
import { ESTADOS_CARRERA_DASHBOARD } from '../../../../domain/models/dashboard-rubros.model';
import { DetalleError } from '../../../../domain/models/detalle-error.model';
import { FechaValoracion } from '../../../../domain/models/fecha-valoracion.model';
import {
  ArchivoDescargado,
  FormatoDescargaCuadro,
} from '../../../../domain/models/reporte-descarga.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { formatearFechaCuadro } from '../cuadro-antiguedad-supremos/cuadro-antiguedad.util';
import { aFilaCuadroMeritosVista, formatearPuntaje } from './cuadro-meritos.util';

/** N015: no existe la fecha de valoración enviada o no hay una activa. */
const CODIGO_FECHA_NO_ENCONTRADA = 'N015';
/** E400: algún filtro no pasó la validación del backend. */
const CODIGO_VALIDACION = 'E400';

/**
 * RF007 - Submenú C: Cuadro de Méritos de Jueces Superiores Titulares (Anexo 02).
 * El backend ordena el cuadro nacional y luego filtra: `orden` es la posición
 * nacional y no se renumera al filtrar ni al paginar (sin ordenar por columna).
 */
@Component({
  selector: 'app-cuadro-meritos-superiores',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './cuadro-meritos-superiores.html',
  styleUrl: './cuadro-meritos-superiores.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuadroMeritosSuperiores implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarFechas = inject(ListarFechasValoracionReporteUseCase);
  private readonly listarCatalogos = inject(ListarCatalogosDashboardUseCase);
  private readonly obtenerCuadro = inject(ObtenerCuadroMeritosUseCase);
  private readonly descargarCuadro = inject(DescargarCuadroMeritosUseCase);

  /** Cada búsqueda cancela la anterior: el cuadro siempre es de los últimos filtros. */
  private readonly consultas = new Subject<FiltrosCuadroMeritos>();

  protected readonly estadosCarrera = ESTADOS_CARRERA_DASHBOARD;
  protected readonly nombreMaxLength = APELLIDOS_NOMBRES_MAX_LENGTH;
  protected readonly opcionesTamanioPagina = [25, 50, 100];

  protected readonly fechas = signal<FechaValoracion[]>([]);
  protected readonly idVigente = signal<string | null>(null);
  protected readonly distritos = signal<CatalogoItem[]>([]);
  protected readonly especialidades = signal<CatalogoItem[]>([]);

  /** Valores escritos en el formulario (aún no buscados). */
  protected readonly filtrosFormulario = signal<FiltrosCuadroMeritos>({
    ...FILTROS_CUADRO_MERITOS_VACIOS,
  });
  /** Filtros de la última búsqueda: los usan las descargas. */
  private readonly filtrosAplicados = signal<FiltrosCuadroMeritos>({
    ...FILTROS_CUADRO_MERITOS_VACIOS,
  });
  protected readonly intentoBuscar = signal(false);

  protected readonly cuadro = signal<CuadroMeritos | null>(null);
  protected readonly error = signal<DetalleError | null>(null);
  protected readonly cargando = signal(true);
  protected readonly descargando = signal<FormatoDescargaCuadro | null>(null);
  protected readonly paginaActual = signal(0);
  protected readonly tamanioPagina = signal(25);

  protected readonly errorDni = computed(() => {
    const dni = this.filtrosFormulario().dni.trim();
    return dni && !DNI_CUADRO_MERITOS_PATRON.test(dni) ? 'Ingrese 8 dígitos.' : null;
  });
  protected readonly errorNombre = computed(() =>
    this.filtrosFormulario().apellidosNombres.trim().length > APELLIDOS_NOMBRES_MAX_LENGTH
      ? `Máximo ${APELLIDOS_NOMBRES_MAX_LENGTH} caracteres.`
      : null
  );
  protected readonly formularioInvalido = computed(() => !!this.errorDni() || !!this.errorNombre());

  protected readonly hayCambiosPendientes = computed(() => {
    const formulario = this.filtrosFormulario();
    const aplicados = this.filtrosAplicados();
    return (Object.keys(formulario) as (keyof FiltrosCuadroMeritos)[]).some(
      (campo) => formulario[campo].trim() !== aplicados[campo].trim()
    );
  });

  /** E400 se muestra junto al formulario; el resto, en el panel del cuadro. */
  protected readonly errorValidacion = computed(() =>
    this.error()?.codigo === CODIGO_VALIDACION ? this.error() : null
  );
  protected readonly errorCuadro = computed(() =>
    this.error() && this.error()?.codigo !== CODIGO_VALIDACION ? this.error() : null
  );
  protected readonly errorDeFecha = computed(
    () => this.error()?.codigo === CODIGO_FECHA_NO_ENCONTRADA
  );

  protected readonly filas = computed(() =>
    (this.cuadro()?.filas ?? []).map(aFilaCuadroMeritosVista)
  );
  /** Paginación en el front: el endpoint devuelve todas las filas. */
  protected readonly filasPagina = computed(() => {
    const inicio = this.paginaActual() * this.tamanioPagina();
    return this.filas().slice(inicio, inicio + this.tamanioPagina());
  });
  protected readonly encabezado = computed(() => {
    const cuadro = this.cuadro();
    return cuadro
      ? {
          fecha: formatearFechaCuadro(cuadro.fechaValoracion),
          puntajeMaximo: formatearPuntaje(cuadro.puntajeMaximo),
        }
      : null;
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
          void this.alertas.error('No se pudieron cargar los filtros', resultado.detalle);
          return;
        }
        this.distritos.set(resultado.catalogos.distritosJudiciales);
        this.especialidades.set(resultado.catalogos.especialidades);
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
        // Sin fecha elegida el backend usa la fecha de valoración activa.
        this.filtrosFormulario.set(this.filtrosIniciales());
        this.consultas.next(this.filtrosIniciales());
      });
  }

  protected onFiltroCambiado<K extends keyof FiltrosCuadroMeritos>(
    campo: K,
    valor: FiltrosCuadroMeritos[K] | null
  ): void {
    this.filtrosFormulario.update((filtros) => ({ ...filtros, [campo]: valor ?? '' }));
  }

  protected onTextoCambiado(campo: 'dni' | 'apellidosNombres', evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    // El DNI solo admite dígitos (el pegado con espacios o guiones se limpia).
    this.onFiltroCambiado(campo, campo === 'dni' ? valor.replace(/\D/g, '') : valor);
  }

  protected onBuscar(evento?: Event): void {
    evento?.preventDefault();
    this.intentoBuscar.set(true);
    if (this.formularioInvalido()) {
      return;
    }
    this.consultas.next(this.normalizar(this.filtrosFormulario()));
  }

  protected onLimpiar(): void {
    this.intentoBuscar.set(false);
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
    // Filtros de la última búsqueda (no lo escrito y aún no buscado) y la fecha del cuadro.
    const filtros: FiltrosCuadroMeritos = {
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

  private filtrosIniciales(): FiltrosCuadroMeritos {
    return { ...FILTROS_CUADRO_MERITOS_VACIOS, idFechaValoracion: this.idVigente() ?? '' };
  }

  private normalizar(filtros: FiltrosCuadroMeritos): FiltrosCuadroMeritos {
    return {
      ...filtros,
      dni: filtros.dni.trim(),
      apellidosNombres: filtros.apellidosNombres.trim(),
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
