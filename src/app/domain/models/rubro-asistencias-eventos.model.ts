/**
 * Rubro E, subrubro E.5 — Asistencia a eventos académicos.
 * El puntaje de cada fila lo calcula el servidor. La web no lo envía.
 * Una línea vigente vale 0.250 y una caduca vale 0.000.
 * El tope 2.000 queda en el subtotal del código E5 de la ficha, no en cada línea.
 */

export const TOPE_PUNTAJE_ASISTENCIAS_EVENTOS = 2;
export const LIMITE_TEMA_ASISTENCIA_EVENTO = 300;
export const PUNTAJE_ASISTENCIA_VIGENTE = 0.25;

export type JuridicoAsistenciaEvento = '1' | '0';

export const OPCIONES_JURIDICO_ASISTENCIA_EVENTO: {
  valor: JuridicoAsistenciaEvento;
  etiqueta: string;
}[] = [
  { valor: '1', etiqueta: 'Jurídico' },
  { valor: '0', etiqueta: 'No jurídico' },
];

export interface AsistenciaEventoAcademico {
  id: string;
  eventoId: string;
  /** Texto de lectura. No se envía. */
  eventoDescripcion: string;
  institucionId: string;
  /** Texto de lectura. No se envía. */
  institucionNombre: string;
  paisId: string;
  /** Texto de lectura. No se envía. */
  nombrePais: string;
  fechaInicio: string;
  fechaFin: string;
  juridico: JuridicoAsistenciaEvento;
  especialidadId: string;
  /** Texto de lectura. No se envía. */
  especialidadDescripcion: string;
  tema: string;
  modalidadId: string;
  /** Texto de lectura. No se envía. */
  modalidadDescripcion: string;
  tipoDocumentoId: string;
  /** Texto de lectura. No se envía. */
  tipoDocumentoDescripcion: string;
  archivoId: string | null;
  /** Solo lectura. Tres decimales en pantalla. */
  puntaje: number;
}

export interface RubroAsistenciasEventos {
  items: AsistenciaEventoAcademico[];
  puntajeTotal: number;
}

export function crearRubroAsistenciasEventosVacio(): RubroAsistenciasEventos {
  return {
    items: [],
    puntajeTotal: 0,
  };
}

export function etiquetaJuridicoAsistenciaEvento(valor: string): string {
  return OPCIONES_JURIDICO_ASISTENCIA_EVENTO.find((item) => item.valor === valor)?.etiqueta ?? valor;
}

/** Puntaje 0.000: el servidor marcó la asistencia como caduca. */
export function etiquetaEstadoAsistenciaEvento(
  item: Pick<AsistenciaEventoAcademico, 'puntaje'>
): string {
  const puntaje = Number(item.puntaje);
  if (Number.isFinite(puntaje) && puntaje === 0) {
    return 'Caduco';
  }
  return '—';
}

/** Suma de filas con el tope del subtotal. Referencia local si la ficha no trae el código E5. */
export function puntajeSubrubroAsistenciasEventos(
  items: Pick<AsistenciaEventoAcademico, 'puntaje'>[]
): number {
  const suma = items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
  const topado = Math.min(TOPE_PUNTAJE_ASISTENCIAS_EVENTOS, suma);
  return Math.round(topado * 1000) / 1000;
}

/** Fecha de término descendente y, en empate, id descendente. */
export function ordenarAsistenciasEventos(
  items: AsistenciaEventoAcademico[]
): AsistenciaEventoAcademico[] {
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
