/**
 * RF007 - Submenú A: gráficos de rubros de valoración (dashboard estadístico).
 * El API devuelve datos ya agregados (conteos y porcentajes) por indicador.
 */

export type NivelMagistraturaDashboard = '1' | '2';

export type EstadoCarreraDashboard = 'ACTIVO' | 'CESANTE';

/** Filtros globales del dashboard. Cadena vacía = sin filtro. */
export interface FiltrosDashboardRubros {
  distritoJudicialId: string;
  /** 1 = Juez Supremo, 2 = Juez Superior. */
  nivelMagistradoId: NivelMagistraturaDashboard | '';
  especialidadId: string;
  estadoCarrera: EstadoCarreraDashboard | '';
  /** `yyyy-MM-dd`. */
  fechaDesde: string;
  /** `yyyy-MM-dd`. */
  fechaHasta: string;
}

export const FILTROS_DASHBOARD_RUBROS_VACIOS: FiltrosDashboardRubros = {
  distritoJudicialId: '',
  nivelMagistradoId: '',
  especialidadId: '',
  estadoCarrera: '',
  fechaDesde: '',
  fechaHasta: '',
};

export const NIVELES_MAGISTRATURA_DASHBOARD: ReadonlyArray<{
  valor: NivelMagistraturaDashboard;
  etiqueta: string;
}> = [
  { valor: '1', etiqueta: 'Juez Supremo' },
  { valor: '2', etiqueta: 'Juez Superior' },
];

export const ESTADOS_CARRERA_DASHBOARD: ReadonlyArray<{
  valor: EstadoCarreraDashboard;
  etiqueta: string;
}> = [
  { valor: 'ACTIVO', etiqueta: 'Activo' },
  { valor: 'CESANTE', etiqueta: 'Cesante' },
];

/** Indicadores disponibles en `GET dashboard/rubros/{indicador}`. */
export type IndicadorDashboardRubro =
  | 'grados-titulos'
  | 'posgrado'
  | 'distrito-judicial'
  | 'sexo'
  | 'especialidad'
  | 'rango-edad'
  | 'demeritos'
  | 'estado-carrera'
  | 'documentos-por-caducar'
  | 'vigencia-documentos';

/** Orden de presentación de los gráficos (numeración del RF). */
export const INDICADORES_DASHBOARD_RUBROS: ReadonlyArray<{
  indicador: IndicadorDashboardRubro;
  titulo: string;
}> = [
  { indicador: 'grados-titulos', titulo: 'Grados y títulos' },
  { indicador: 'posgrado', titulo: 'Estudios de doctorado y maestría' },
  { indicador: 'distrito-judicial', titulo: 'Jueces por distrito judicial' },
  { indicador: 'sexo', titulo: 'Jueces por sexo' },
  { indicador: 'especialidad', titulo: 'Jueces por especialidad' },
  { indicador: 'rango-edad', titulo: 'Jueces por rango de edad' },
  { indicador: 'demeritos', titulo: 'Medidas disciplinarias' },
  { indicador: 'estado-carrera', titulo: 'Jueces activos y cesantes' },
  { indicador: 'documentos-por-caducar', titulo: 'Documentos próximos a caducar' },
  { indicador: 'vigencia-documentos', titulo: 'Documentos caducados y no caducados' },
];

export interface ItemIndicadorDashboard {
  clave: string;
  etiqueta: string;
  cantidad: number;
  /** Porcentaje sobre el total de la serie (2 decimales). */
  porcentaje: number;
}

export interface SerieIndicadorDashboard {
  serie: string;
  total: number;
  items: ItemIndicadorDashboard[];
}

export interface IndicadorDashboard {
  indicador: string;
  descripcion: string;
  /** Total de magistrados del universo filtrado. */
  total: number;
  series: SerieIndicadorDashboard[];
}
