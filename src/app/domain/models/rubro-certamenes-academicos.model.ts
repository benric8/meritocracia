/**
 * Rubro E, subrubro E.4 — Certámenes académicos.
 * El puntaje de cada fila lo calcula el servidor. La web no lo envía.
 * El tope 2.000 del subrubro queda en el puntaje del código E4 de la ficha.
 */

export const TOPE_PUNTAJE_CERTAMENES_ACADEMICOS = 2;
export const LIMITE_TEMA_CERTAMEN = 300;

export type JuridicoCertamen = '1' | '0';

export const OPCIONES_JURIDICO_CERTAMEN: {
  valor: JuridicoCertamen;
  etiqueta: string;
}[] = [
  { valor: '1', etiqueta: 'Jurídico' },
  { valor: '0', etiqueta: 'No jurídico' },
];

export interface CatalogoCertamen {
  id: string;
  codigo: string;
  descripcion: string;
}

export interface CertamenAcademico {
  id: string;
  eventoId: string;
  /** Texto de lectura. No se envía. */
  eventoDescripcion: string;
  tipoParticipacionId: string;
  /** Texto de lectura. No se envía. */
  tipoParticipacionDescripcion: string;
  institucionId: string;
  /** Texto de lectura. No se envía. */
  institucionNombre: string;
  paisId: string;
  /** Texto de lectura. No se envía. */
  nombrePais: string;
  fechaInicio: string;
  fechaFin: string;
  juridico: JuridicoCertamen;
  especialidadId: string;
  /** Texto de lectura. No se envía. */
  especialidadDescripcion: string;
  tema: string;
  modalidadId: string;
  /** Texto de lectura. No se envía. */
  modalidadDescripcion: string;
  archivoId: string | null;
  /** Solo lectura. Tres decimales en pantalla. */
  puntaje: number;
}

export interface RubroCertamenesAcademicos {
  items: CertamenAcademico[];
  puntajeTotal: number;
}

export function crearRubroCertamenesAcademicosVacio(): RubroCertamenesAcademicos {
  return {
    items: [],
    puntajeTotal: 0,
  };
}

export function etiquetaJuridicoCertamen(valor: string): string {
  return OPCIONES_JURIDICO_CERTAMEN.find((item) => item.valor === valor)?.etiqueta ?? valor;
}

/** Puntaje 0.000: la fecha de fin quedó fuera de los cinco años anteriores a la valoración. */
export function etiquetaEstadoCertamen(item: Pick<CertamenAcademico, 'puntaje'>): string {
  const puntaje = Number(item.puntaje);
  if (Number.isFinite(puntaje) && puntaje === 0) {
    return 'Caduco';
  }
  return '—';
}

/** Suma de filas con el tope del subrubro. Referencia local si la ficha no trae el código E4. */
export function puntajeSubrubroCertamenesAcademicos(
  items: Pick<CertamenAcademico, 'puntaje'>[]
): number {
  const suma = items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
  const topado = Math.min(TOPE_PUNTAJE_CERTAMENES_ACADEMICOS, suma);
  return Math.round(topado * 1000) / 1000;
}

/** Fecha de término descendente y, en empate, id descendente. */
export function ordenarCertamenesAcademicos(items: CertamenAcademico[]): CertamenAcademico[] {
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
