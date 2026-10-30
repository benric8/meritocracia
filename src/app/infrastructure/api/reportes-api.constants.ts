import { FormatoDescargaCuadro } from '../../domain/models/cuadro-antiguedad.model';

/** Endpoints de reportes (relativos a `environment.urlApi`). */
export const cuadroAntiguedadEndpoints = {
  /** Prefijo común de consulta y descargas (usado por el interceptor de errores). */
  BASE: 'reportes/cuadro-antiguedad/',
  /** GET `?fecha_valoracion_id=` → JSON con el cuadro. */
  JUECES_SUPREMOS: 'reportes/cuadro-antiguedad/jueces-supremos',
  /** GET `?fecha_valoracion_id=` → `.xlsx` / `.pdf` (o `GlobalResponse` JSON si falla). */
  descarga: (formato: FormatoDescargaCuadro) =>
    `reportes/cuadro-antiguedad/jueces-supremos/${formato}`,
} as const;

export const cuadroMeritosEndpoints = {
  /** Prefijo común de consulta y descargas (usado por el interceptor de errores). */
  BASE: 'reportes/cuadro-meritos/',
  /**
   * GET `?fecha_valoracion_id=&distrito_judicial_id=&especialidad_id=&numero_documento=
   * &apellidos_nombres=&estado_carrera=` → JSON con el cuadro.
   */
  JUECES_SUPERIORES: 'reportes/cuadro-meritos/jueces-superiores',
  /** Mismos filtros → `.xlsx` / `.pdf` (o `GlobalResponse` JSON si falla). */
  descarga: (formato: FormatoDescargaCuadro) =>
    `reportes/cuadro-meritos/jueces-superiores/${formato}`,
} as const;
