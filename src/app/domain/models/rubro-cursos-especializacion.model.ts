/**
 * Rubro E, subrubro E.3 — Cursos de especialización, postgrado y diplomados.
 * El puntaje de cada fila lo calcula el servidor. La web no lo envía.
 * El tope 3.000 del subrubro queda en el puntaje del código E3 de la ficha.
 */

export const TOPE_PUNTAJE_CURSOS_ESPECIALIZACION = 3;
export const LIMITE_NOMBRE_CURSO = 300;

export type JuridicoCurso = '1' | '0';
export type TrasladoEventoCurso = '1' | '0';

export const OPCIONES_JURIDICO_CURSO: {
  valor: JuridicoCurso;
  etiqueta: string;
}[] = [
  { valor: '1', etiqueta: 'Jurídico' },
  { valor: '0', etiqueta: 'No jurídico' },
];

export interface TipoCursoEspecializacionCatalogo {
  id: string;
  codigo: string;
  descripcion: string;
}

export interface CursoEspecializacion {
  id: string;
  tipoCursoEspecializacionId: string;
  /** Texto de lectura. No se envía. */
  tipoCursoEspecializacionDescripcion: string;
  nombreCurso: string;
  institucionId: string;
  /** Texto de lectura. No se envía. */
  institucionNombre: string;
  paisId: string;
  /** Texto de lectura. No se envía. */
  nombrePais: string;
  fechaInicio: string;
  fechaFin: string;
  juridico: JuridicoCurso;
  especialidadId: string;
  /** Texto de lectura. No se envía. */
  especialidadDescripcion: string;
  tiempoHoras: number;
  archivoId: string | null;
  /** Solo lectura. Tres decimales en pantalla. */
  puntaje: number;
  /** Solo lectura. "1" si el curso tiene menos de 50 horas. */
  trasladoEvento: TrasladoEventoCurso;
}

export interface RubroCursosEspecializacion {
  items: CursoEspecializacion[];
  puntajeTotal: number;
}

export function crearRubroCursosEspecializacionVacio(): RubroCursosEspecializacion {
  return {
    items: [],
    puntajeTotal: 0,
  };
}

export function etiquetaJuridicoCurso(valor: string): string {
  return OPCIONES_JURIDICO_CURSO.find((item) => item.valor === valor)?.etiqueta ?? valor;
}

/**
 * "1": menos de 50 horas, puntaje 0.000 y pendiente del subrubro de eventos.
 * Puntaje 0.000 con traslado "0": caduco por fecha de fin fuera de los cinco años.
 */
export function etiquetaEstadoCurso(
  item: Pick<CursoEspecializacion, 'puntaje' | 'trasladoEvento'>
): string {
  if (item.trasladoEvento === '1') {
    return 'Pendiente de eventos';
  }
  const puntaje = Number(item.puntaje);
  if (item.trasladoEvento === '0' && Number.isFinite(puntaje) && puntaje === 0) {
    return 'Caduco';
  }
  return '—';
}

/** Suma de filas con el tope del subrubro. Referencia local si la ficha no trae el código E3. */
export function puntajeSubrubroCursosEspecializacion(
  items: Pick<CursoEspecializacion, 'puntaje'>[]
): number {
  const suma = items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
  const topado = Math.min(TOPE_PUNTAJE_CURSOS_ESPECIALIZACION, suma);
  return Math.round(topado * 1000) / 1000;
}

/** Fecha de término descendente y, en empate, id descendente. */
export function ordenarCursosEspecializacion(items: CursoEspecializacion[]): CursoEspecializacion[] {
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
