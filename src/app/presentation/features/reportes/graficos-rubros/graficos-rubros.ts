import { DatePipe } from '@angular/common';
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
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { ListarCatalogosDashboardUseCase } from '../../../../application/use-cases/reportes/listar-catalogos-dashboard.use-case';
import {
  ObtenerIndicadoresDashboardUseCase,
  ResultadosIndicadoresDashboard,
} from '../../../../application/use-cases/reportes/obtener-indicadores-dashboard.use-case';
import { CatalogoItem } from '../../../../domain/models/catalogo-item.model';
import {
  ESTADOS_CARRERA_DASHBOARD,
  FILTROS_DASHBOARD_RUBROS_VACIOS,
  FiltrosDashboardRubros,
  IndicadorDashboard,
  IndicadorDashboardRubro,
  INDICADORES_DASHBOARD_RUBROS,
  NIVELES_MAGISTRATURA_DASHBOARD,
} from '../../../../domain/models/dashboard-rubros.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { formatearFechaCorta } from '../../meritos/fecha/fecha-valoracion.util';
import { GraficoIndicador } from './grafico-indicador/grafico-indicador';
import { totalDocumentosPorCaducar } from './grafico-indicador/grafico-indicador.util';
import {
  INDICADORES_ANCHO_COMPLETO,
  INDICADORES_EN_COLUMNAS,
  kpisPestana,
  PestanaDashboard,
  PESTANAS_DASHBOARD,
} from './graficos-rubros.config';

interface FiltroAplicado {
  campo: keyof FiltrosDashboardRubros;
  etiqueta: string;
  valor: string;
}

const TITULOS_INDICADOR = new Map(
  INDICADORES_DASHBOARD_RUBROS.map(({ indicador, titulo }) => [indicador, titulo])
);

/**
 * RF007 - Submenú A: Gráficos de Rubros de Valoración (solo Administrador).
 * Todos los gráficos se recalculan en el API con los mismos filtros globales;
 * las pestañas solo organizan la presentación (mockup 06a).
 */
@Component({
  selector: 'app-graficos-rubros',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    GraficoIndicador,
  ],
  templateUrl: './graficos-rubros.html',
  styleUrl: './graficos-rubros.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficosRubros implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarCatalogos = inject(ListarCatalogosDashboardUseCase);
  private readonly obtenerIndicadores = inject(ObtenerIndicadoresDashboardUseCase);

  protected readonly niveles = NIVELES_MAGISTRATURA_DASHBOARD;
  protected readonly estadosCarrera = ESTADOS_CARRERA_DASHBOARD;
  protected readonly pestanas = PESTANAS_DASHBOARD;

  protected readonly distritos = signal<CatalogoItem[]>([]);
  protected readonly especialidades = signal<CatalogoItem[]>([]);

  /** Valores elegidos en los filtros (aún no aplicados). */
  protected readonly filtrosFormulario = signal<FiltrosDashboardRubros>({
    ...FILTROS_DASHBOARD_RUBROS_VACIOS,
  });
  /** Filtros con los que se calcularon los gráficos visibles. */
  private readonly filtrosAplicados = signal<FiltrosDashboardRubros>({
    ...FILTROS_DASHBOARD_RUBROS_VACIOS,
  });

  protected readonly pestanaActiva = signal<PestanaDashboard>('rubros');
  protected readonly filtrosVisibles = signal(true);
  protected readonly resultados = signal<Partial<ResultadosIndicadoresDashboard>>({});
  protected readonly cargando = signal(false);
  protected readonly actualizadoEn = signal<Date | null>(null);

  protected readonly rangoFechasInvalido = computed(() => {
    const { fechaDesde, fechaHasta } = this.filtrosFormulario();
    return !!fechaDesde && !!fechaHasta && fechaDesde > fechaHasta;
  });

  protected readonly hayCambiosPendientes = computed(() => {
    const formulario = this.filtrosFormulario();
    const aplicados = this.filtrosAplicados();
    return (Object.keys(formulario) as (keyof FiltrosDashboardRubros)[]).some(
      (campo) => formulario[campo] !== aplicados[campo]
    );
  });

  protected readonly resumenFiltros = computed<FiltroAplicado[]>(() =>
    this.describirFiltros(this.filtrosAplicados())
  );

  protected readonly pestana = computed(
    () => this.pestanas.find((p) => p.id === this.pestanaActiva()) ?? this.pestanas[0]
  );

  protected readonly graficosPestana = computed(() => {
    const indicadores = this.pestana().indicadores;
    return indicadores.map((indicador) => ({
      indicador,
      titulo: TITULOS_INDICADOR.get(indicador) ?? indicador,
      anchoCompleto: indicadores.length === 1 || INDICADORES_ANCHO_COMPLETO.has(indicador),
      enColumnas: INDICADORES_EN_COLUMNAS.has(indicador),
    }));
  });

  protected readonly kpis = computed(() =>
    kpisPestana(this.pestanaActiva(), (indicador) => this.indicadorDe(indicador))
  );

  /** Insignia de "Próximos a caducar", visible desde cualquier pestaña. */
  protected readonly documentosPorCaducar = computed(() =>
    totalDocumentosPorCaducar(this.indicadorDe('documentos-por-caducar'))
  );

  protected readonly pestanasConError = computed(() => {
    const resultados = this.resultados();
    return new Set(
      this.pestanas
        .filter((p) => p.indicadores.some((indicador) => resultados[indicador]?.exito === false))
        .map((p) => p.id)
    );
  });

  ngOnInit(): void {
    this.cargarCatalogos();
    this.consultar();
  }

  protected onFiltroCambiado<K extends keyof FiltrosDashboardRubros>(
    campo: K,
    valor: FiltrosDashboardRubros[K] | null
  ): void {
    this.filtrosFormulario.update((filtros) => ({ ...filtros, [campo]: valor ?? '' }));
  }

  protected onConsultar(event?: Event): void {
    event?.preventDefault();
    if (this.rangoFechasInvalido() || this.cargando()) {
      return;
    }
    this.consultar();
  }

  protected onLimpiar(): void {
    this.filtrosFormulario.set({ ...FILTROS_DASHBOARD_RUBROS_VACIOS });
    this.consultar();
  }

  protected onQuitarFiltro(campo: keyof FiltrosDashboardRubros): void {
    // Se parte de lo aplicado: quitar un chip no debe aplicar cambios a medio editar.
    this.filtrosFormulario.set({ ...this.filtrosAplicados(), [campo]: '' });
    this.consultar();
  }

  protected onCambiarPestana(pestana: PestanaDashboard): void {
    this.pestanaActiva.set(pestana);
  }

  /** Navegación con flechas entre pestañas (patrón WAI-ARIA tabs). */
  protected onTeclaPestana(evento: KeyboardEvent): void {
    const desplazamientos: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    const desplazamiento = desplazamientos[evento.key];
    if (!desplazamiento) {
      return;
    }
    evento.preventDefault();
    const total = this.pestanas.length;
    const indice = this.pestanas.findIndex((p) => p.id === this.pestanaActiva());
    const siguiente = this.pestanas[(indice + desplazamiento + total) % total];
    this.pestanaActiva.set(siguiente.id);
    document.getElementById(`pestana-${siguiente.id}`)?.focus();
  }

  protected alternarFiltros(): void {
    this.filtrosVisibles.update((visibles) => !visibles);
  }

  protected indicadorDe(indicador: IndicadorDashboardRubro): IndicadorDashboard | null {
    const resultado = this.resultados()[indicador];
    return resultado?.exito ? resultado.indicador : null;
  }

  protected errorDe(indicador: IndicadorDashboardRubro): string | null {
    const resultado = this.resultados()[indicador];
    return resultado && !resultado.exito ? resultado.detalle.mensaje : null;
  }

  private describirFiltros(filtros: FiltrosDashboardRubros): FiltroAplicado[] {
    const nombre = (lista: CatalogoItem[], id: string) =>
      lista.find((item) => item.id === id)?.nombre ?? id;
    const resumen: FiltroAplicado[] = [];

    if (filtros.distritoJudicialId) {
      resumen.push({
        campo: 'distritoJudicialId',
        etiqueta: 'Distrito',
        valor: nombre(this.distritos(), filtros.distritoJudicialId),
      });
    }
    if (filtros.nivelMagistradoId) {
      resumen.push({
        campo: 'nivelMagistradoId',
        etiqueta: 'Nivel',
        valor:
          this.niveles.find((n) => n.valor === filtros.nivelMagistradoId)?.etiqueta ??
          filtros.nivelMagistradoId,
      });
    }
    if (filtros.especialidadId) {
      resumen.push({
        campo: 'especialidadId',
        etiqueta: 'Especialidad',
        valor: nombre(this.especialidades(), filtros.especialidadId),
      });
    }
    if (filtros.estadoCarrera) {
      resumen.push({
        campo: 'estadoCarrera',
        etiqueta: 'Estado',
        valor:
          this.estadosCarrera.find((e) => e.valor === filtros.estadoCarrera)?.etiqueta ??
          filtros.estadoCarrera,
      });
    }
    if (filtros.fechaDesde) {
      resumen.push({
        campo: 'fechaDesde',
        etiqueta: 'Desde',
        valor: formatearFechaCorta(filtros.fechaDesde),
      });
    }
    if (filtros.fechaHasta) {
      resumen.push({
        campo: 'fechaHasta',
        etiqueta: 'Hasta',
        valor: formatearFechaCorta(filtros.fechaHasta),
      });
    }
    return resumen;
  }

  private cargarCatalogos(): void {
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
  }

  private consultar(): void {
    const filtros = { ...this.filtrosFormulario() };
    this.cargando.set(true);

    this.obtenerIndicadores
      .ejecutar(filtros)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe((resultados) => {
        this.filtrosAplicados.set(filtros);
        this.resultados.set(resultados);
        this.actualizadoEn.set(new Date());

        // Un solo aviso aunque fallen varios gráficos (el interceptor no notifica estos GET).
        const fallido = Object.values(resultados).find((resultado) => !resultado.exito);
        if (fallido && !fallido.exito) {
          void this.alertas.error('No se pudieron cargar algunos gráficos', fallido.detalle);
        }
      });
  }
}
