/**
 * Rubro E, subrubro E.2 — Pasantías.
 * El puntaje de cada fila lo calcula el servidor. La web no lo envía.
 * El tope 1.500 del subrubro queda en el puntaje del rubro E de la ficha.
 */

export const TOPE_PUNTAJE_PASANTIAS = 1.5;
export const LIMITE_MENCION_PASANTIA = 300;

export type JuridicoPasantia = '1' | '0';

export const OPCIONES_JURIDICO_PASANTIA: {
  valor: JuridicoPasantia;
  etiqueta: string;
}[] = [
  { valor: '1', etiqueta: 'Sí' },
  { valor: '0', etiqueta: 'No' },
];

export interface TipoPasantiaCatalogo {
  id: string;
  codigo: string;
  descripcion: string;
}

export interface Pasantia {
  id: string;
  tipoPasantiaId: string;
  /** Texto de lectura. No se envía. */
  tipoPasantiaDescripcion: string;
  institucionId: string;
  /** Texto de lectura. No se envía. */
  institucionNombre: string;
  paisId: string;
  /** Texto de lectura. No se envía. */
  paisNombre: string;
  fechaInicio: string;
  fechaFin: string;
  juridico: JuridicoPasantia;
  especialidadId: string;
  /** Texto de lectura. No se envía. */
  especialidadDescripcion: string;
  mencion: string;
  archivoId: string | null;
  /** Solo lectura. 0.000 si la pasantía está caduca. */
  puntaje: number;
}

export interface RubroPasantias {
  items: Pasantia[];
  puntajeTotal: number;
}

export function crearRubroPasantiasVacio(): RubroPasantias {
  return {
    items: [],
    puntajeTotal: 0,
  };
}

export function etiquetaJuridicoPasantia(valor: string): string {
  return OPCIONES_JURIDICO_PASANTIA.find((item) => item.valor === valor)?.etiqueta ?? valor;
}

/** Suma de filas con el tope del subrubro. Referencia local si la ficha no trae el código E2. */
export function puntajeSubrubroPasantias(items: Pick<Pasantia, 'puntaje'>[]): number {
  const suma = items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
  const topado = Math.min(TOPE_PUNTAJE_PASANTIAS, suma);
  return Math.round(topado * 1000) / 1000;
}

/** Fecha de término descendente y, en empate, id descendente. */
export function ordenarPasantias(items: Pasantia[]): Pasantia[] {
  return [...items].sort((a, b) => {
    if (a.fechaFin !== b.fechaFin) {
      return b.fechaFin.localeCompare(a.fechaFin);
    }
    const idA = Number(a.id);
    const idB = Number(b.id);
    if (Number.isFinite(idA) && Number.isFinite(idB) && idA !== idB) {
      return idB - idA;
    }
    return 0;
  });
}
