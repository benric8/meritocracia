import {
  IndicadorDashboard,
  IndicadorDashboardRubro,
} from '../../../../domain/models/dashboard-rubros.model';

export type PestanaDashboard = 'rubros' | 'cesantes' | 'proximos' | 'vigencia';

export interface ConfigPestanaDashboard {
  id: PestanaDashboard;
  grupo: 'Estadísticas' | 'Consultas';
  etiqueta: string;
  icono: string;
  descripcion: string;
  indicadores: IndicadorDashboardRubro[];
}

/** Organización del submenú según el mockup 06a (RF007 - a). */
export const PESTANAS_DASHBOARD: ReadonlyArray<ConfigPestanaDashboard> = [
  {
    id: 'rubros',
    grupo: 'Estadísticas',
    etiqueta: 'Gráficos por rubros',
    icono: 'bar_chart',
    descripcion:
      'Grados y títulos, posgrado, distrito judicial, sexo, especialidad, rango de edad y medidas disciplinarias.',
    // Ordenados en parejas de altura similar (grid de 2 columnas);
    // distrito judicial va al final a todo el ancho por su cantidad de cortes.
    indicadores: [
      'grados-titulos',
      'posgrado',
      'sexo',
      'demeritos',
      'especialidad',
      'rango-edad',
      'distrito-judicial',
    ],
  },
  {
    id: 'cesantes',
    grupo: 'Consultas',
    etiqueta: 'Jueces cesantes',
    icono: 'how_to_reg',
    descripcion: 'Condición de actividad del magistrado según la ficha de antigüedad.',
    indicadores: ['estado-carrera'],
  },
  {
    id: 'proximos',
    grupo: 'Consultas',
    etiqueta: 'Próximos a caducar',
    icono: 'event_busy',
    descripcion:
      'Documentos sujetos a caducidad que siguen vigentes hoy y vencen antes de fin de año.',
    indicadores: ['documentos-por-caducar'],
  },
  {
    id: 'vigencia',
    grupo: 'Consultas',
    etiqueta: 'Caducados y vigentes',
    icono: 'fact_check',
    descripcion: 'Estado de vigencia, a la fecha, de los documentos sujetos a caducidad.',
    indicadores: ['vigencia-documentos'],
  },
];

/** Gráficos que ocupan todo el ancho del grid. */
export const INDICADORES_ANCHO_COMPLETO: ReadonlySet<IndicadorDashboardRubro> = new Set([
  'distrito-judicial',
  'estado-carrera',
  'documentos-por-caducar',
  'vigencia-documentos',
]);

/** Gráficos con muchas categorías: las barras se reparten en columnas. */
export const INDICADORES_EN_COLUMNAS: ReadonlySet<IndicadorDashboardRubro> = new Set([
  'distrito-judicial',
]);

export interface KpiDashboard {
  etiqueta: string;
  valor: number;
  /** Porcentaje respecto al total de la serie; null en los totales. */
  porcentaje: number | null;
  destacado: boolean;
  icono?: string;
}

type ObtenerIndicador = (indicador: IndicadorDashboardRubro) => IndicadorDashboard | null;

/** Ítems de una serie convertidos en tarjetas de resumen. */
function kpisDeSerie(indicador: IndicadorDashboard | null, serie?: string): KpiDashboard[] {
  const encontrada = serie
    ? indicador?.series.find((s) => s.serie.trim().toUpperCase() === serie)
    : indicador?.series[0];
  return (encontrada?.items ?? []).map((item) => ({
    etiqueta: item.etiqueta,
    valor: item.cantidad,
    porcentaje: item.porcentaje,
    destacado: false,
  }));
}

function totalSerie(indicador: IndicadorDashboard | null, serie: string): number | null {
  const encontrada = indicador?.series.find((s) => s.serie.trim().toUpperCase() === serie);
  return encontrada ? encontrada.total : null;
}

/** Tarjetas de resumen de cada pestaña a partir de los indicadores ya cargados. */
export function kpisPestana(pestana: PestanaDashboard, obtener: ObtenerIndicador): KpiDashboard[] {
  switch (pestana) {
    case 'rubros': {
      const total = obtener('sexo')?.total ?? obtener('grados-titulos')?.total;
      return total == null
        ? []
        : [{ etiqueta: 'Magistrados evaluados', valor: total, porcentaje: null, destacado: true }];
    }
    case 'cesantes': {
      const indicador = obtener('estado-carrera');
      if (!indicador) {
        return [];
      }
      return [
        ...kpisDeSerie(indicador),
        { etiqueta: 'Total de magistrados', valor: indicador.total, porcentaje: null, destacado: true },
      ];
    }
    case 'proximos': {
      const indicador = obtener('documentos-por-caducar');
      const documentos = totalSerie(indicador, 'DOCUMENTOS');
      if (!indicador || documentos == null) {
        return [];
      }
      return [
        {
          etiqueta: 'Documentos por caducar',
          valor: documentos,
          porcentaje: null,
          destacado: true,
          icono: documentos > 0 ? 'warning_amber' : undefined,
        },
        ...kpisDeSerie(indicador, 'MAGISTRADOS'),
      ];
    }
    case 'vigencia': {
      const indicador = obtener('vigencia-documentos');
      const total = totalSerie(indicador, 'TOTAL');
      if (!indicador || total == null) {
        return [];
      }
      return [
        ...kpisDeSerie(indicador, 'TOTAL'),
        { etiqueta: 'Documentos evaluados', valor: total, porcentaje: null, destacado: true },
      ];
    }
  }
}
