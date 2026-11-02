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
  /** GET `?fecha_valoracion_id=&distrito_judicial_id=` → JSON con el cuadro (Anexo 03). */
  JUECES_SUPERIORES: 'reportes/cuadro-antiguedad/jueces-superiores',
  /** Mismos filtros → `.xlsx` / `.pdf` (o `GlobalResponse` JSON si falla). */
  descargaSuperiores: (formato: FormatoDescargaCuadro) =>
    `reportes/cuadro-antiguedad/jueces-superiores/${formato}`,
} as const;

export const fichaValoracionReporteEndpoints = {
  /** Prefijo común de consulta y descarga (usado por el interceptor de errores). */
  BASE: 'reportes/ficha-valoracion/',
  /** GET → JSON con la ficha (Anexo 04). */
  porId: (idFicha: string) =>
    `reportes/ficha-valoracion/${encodeURIComponent(idFicha.trim())}`,
  /** GET → `.pdf` (o `GlobalResponse` JSON si falla). */
  pdf: (idFicha: string) => `reportes/ficha-valoracion/${encodeURIComponent(idFicha.trim())}/pdf`,
} as const;

export const carpetaPersonalEndpoints = {
  /** Prefijo común de consulta y descarga (usado por el interceptor de errores). */
  BASE: 'reportes/carpeta-personal/',
  /** GET → JSON con la carpeta, incluida la foto en Base64 (Anexo 05). */
  porId: (idFicha: string) =>
    `reportes/carpeta-personal/${encodeURIComponent(idFicha.trim())}`,
  /** GET → `.pdf` (o `GlobalResponse` JSON si falla). */
  pdf: (idFicha: string) => `reportes/carpeta-personal/${encodeURIComponent(idFicha.trim())}/pdf`,
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
