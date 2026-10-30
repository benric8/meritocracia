/** Tiempo calculado por el backend (meses de 0 a 11). No se recalcula en el front. */
export interface TiempoAntiguedad {
  anios: number;
  meses: number;
  dias: number;
}

/** Fila del Anexo 01: fechas `yyyy-MM-dd`, cualquiera puede faltar. */
export interface FilaCuadroAntiguedad {
  orden: number;
  idMagistrado: string;
  idFichaValoracion: string;
  apellidosNombres: string;
  fechaNacimiento: string | null;
  fechaJuramentoTitular: string | null;
  tiempoTitular: TiempoAntiguedad | null;
  inicioJuezSuperior: string | null;
  finJuezSuperior: string | null;
  tiempoJuezSuperior: TiempoAntiguedad | null;
  inicioProvisional: string | null;
  /** `null` con periodos > 0: el último periodo provisional sigue abierto. */
  finProvisional: string | null;
  periodosProvisional: number | null;
  tiempoProvisional: TiempoAntiguedad | null;
  fechaColegiatura: string | null;
  aniosColegiatura: number | null;
}

/** Cuadro de Antigüedad de Jueces Supremos Titulares (RF007 — Submenú B, Anexo 01). */
export interface CuadroAntiguedad {
  idFechaValoracion: string;
  fechaValoracion: string;
  /** Nota (*) obligatoria al pie del anexo; la redacta el backend. */
  nota: string;
  /** Ya ordenadas por precedencia; `orden` es el N° correlativo. */
  filas: FilaCuadroAntiguedad[];
}

export type { ArchivoDescargado, FormatoDescargaCuadro } from './reporte-descarga.model';
