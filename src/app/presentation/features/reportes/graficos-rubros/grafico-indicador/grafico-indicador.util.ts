import {
  IndicadorDashboard,
  IndicadorDashboardRubro,
  ItemIndicadorDashboard,
  SerieIndicadorDashboard,
} from '../../../../../domain/models/dashboard-rubros.model';

/** Títulos legibles de las series que devuelve el API. */
const TITULOS_SERIE: Readonly<Record<string, string>> = {
  TOTAL: 'Con / sin registro',
  MAXIMO_GRADO: 'Grado más alto',
  ESTUDIOS: 'Estudios de posgrado',
  GRADOS: 'Grados de posgrado',
  PRIMERA: 'Primera especialidad',
  SEGUNDA: 'Segunda especialidad',
  DOCUMENTOS: 'Documentos por tipo',
  MAGISTRADOS: 'Magistrados con / sin documentos por caducar',
  VIGENTES: 'Vigentes por tipo de documento',
  CADUCADOS: 'Caducados por tipo de documento',
};

/** Títulos de serie que dependen del indicador (la misma serie significa otra cosa). */
const TITULOS_SERIE_POR_INDICADOR: Partial<
  Record<IndicadorDashboardRubro, Readonly<Record<string, string>>>
> = {
  'vigencia-documentos': { TOTAL: 'Vigentes y caducados' },
};

/** Series cuyas cantidades son documentos y no magistrados. */
const SERIES_DE_DOCUMENTOS: Partial<Record<IndicadorDashboardRubro, ReadonlySet<string>>> = {
  'documentos-por-caducar': new Set(['DOCUMENTOS']),
  'vigencia-documentos': new Set(['TOTAL', 'VIGENTES', 'CADUCADOS']),
};

/** Claves que agrupan a magistrados sin dato (se pintan en gris neutro). */
const CLAVES_SIN_DATO = new Set(['SIN_REGISTRO', 'FUERA_DE_RANGO', 'NINGUNO', 'NO_REGISTRA']);

export type UnidadSerie = 'magistrados' | 'documentos';

export interface BarraGrafico extends ItemIndicadorDashboard {
  /** Ancho de la barra relativo a la mayor cantidad de la serie (0-100). */
  ancho: number;
  sinDato: boolean;
}

export interface SerieGrafico {
  serie: string;
  titulo: string;
  total: number;
  unidad: UnidadSerie;
  barras: BarraGrafico[];
}

export function tituloSerie(serie: string, indicador?: IndicadorDashboardRubro): string {
  const clave = serie.trim().toUpperCase();
  const especifico = indicador ? TITULOS_SERIE_POR_INDICADOR[indicador]?.[clave] : undefined;
  if (especifico) {
    return especifico;
  }
  if (TITULOS_SERIE[clave]) {
    return TITULOS_SERIE[clave];
  }
  const texto = clave.replace(/_/g, ' ').toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function unidadSerie(serie: string, indicador?: IndicadorDashboardRubro): UnidadSerie {
  const clave = serie.trim().toUpperCase();
  return indicador && SERIES_DE_DOCUMENTOS[indicador]?.has(clave) ? 'documentos' : 'magistrados';
}

export function esClaveSinDato(clave: string): boolean {
  const normalizada = clave.trim().toUpperCase();
  return CLAVES_SIN_DATO.has(normalizada) || normalizada.startsWith('SIN_');
}

export function aSerieGrafico(
  serie: SerieIndicadorDashboard,
  indicador?: IndicadorDashboardRubro
): SerieGrafico {
  const maximo = Math.max(0, ...serie.items.map((item) => item.cantidad));
  return {
    serie: serie.serie,
    titulo: tituloSerie(serie.serie, indicador),
    total: serie.total,
    unidad: unidadSerie(serie.serie, indicador),
    barras: serie.items.map((item) => ({
      ...item,
      ancho: maximo > 0 ? (item.cantidad / maximo) * 100 : 0,
      sinDato: esClaveSinDato(item.clave),
    })),
  };
}

/** Cantidad de documentos que caducan en el ciclo actual (panel de alerta). */
export function totalDocumentosPorCaducar(indicador: IndicadorDashboard | null): number {
  const serie = indicador?.series.find((s) => s.serie.trim().toUpperCase() === 'DOCUMENTOS');
  return serie?.total ?? 0;
}
