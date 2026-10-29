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
