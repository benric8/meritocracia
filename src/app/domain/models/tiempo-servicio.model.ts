/**
 * Tiempo de servicio desglosado (años / meses / días) con etiqueta legible.
 */
export interface TiempoServicio {
  anios: number;
  meses: number;
  dias: number;
  /** Ej.: "11 aa 8 mm 22 dd" */
  etiqueta: string;
}

export const TIEMPO_SERVICIO_CERO: TiempoServicio = {
  anios: 0,
  meses: 0,
  dias: 0,
  etiqueta: '0 aa 0 mm 0 dd',
};

export interface CalculoTiempoTitularParams {
  fechaJuramentacion: string;
  fechaCese?: string | null;
  fechaReincorporacion?: string | null;
  fechaValoracion: string;
}
