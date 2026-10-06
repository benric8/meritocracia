/**
 * Rubro E, subrubro E.6 — Estudios de ofimática.
 * El puntaje de cada fila lo calcula el servidor. La web no lo envía.
 * Básico (o nivel no indicado) vale 0.500, intermedio 0.750 y avanzado 1.000.
 * Si el nivel ya está registrado, la otra línea queda en 0.000.
 * El tope 2.000 queda en el subtotal del código E6 de la ficha, no en cada línea.
 */

export const TOPE_PUNTAJE_OFIMATICA = 2;
export const LIMITE_NOMBRE_CURSO_OFIMATICA = 300;
export const CODIGO_NIVEL_OFIMATICA_BASICO = 'BASICO';

export interface NivelOfimaticaCatalogo {
  id: string;
  codigo: string;
  descripcion: string;
}

export interface EstudioOfimatica {
  id: string;
  nombreCurso: string;
  institucionId: string;
  /** Texto de lectura. No se envía. */
  institucionNombre: string;
  paisId: string;
  /** Texto de lectura. No se envía. */
  nombrePais: string;
  duracionHoras: number;
  nivelOfimaticaId: string;
  /** Texto de lectura. No se envía. Sirve para resolver BÁSICO en el formulario. */
  nivelOfimaticaCodigo: string;
  /** Texto de lectura. No se envía. */
  nivelOfimaticaDescripcion: string;
  tipoDocumentoId: string;
  /** Texto de lectura. No se envía. */
  tipoDocumentoDescripcion: string;
  fechaObtencion: string;
  archivoId: string | null;
  /** Solo lectura. Tres decimales en pantalla. */
  puntaje: number;
}

export interface RubroOfimatica {
  items: EstudioOfimatica[];
  puntajeTotal: number;
}

export function crearRubroOfimaticaVacio(): RubroOfimatica {
  return {
    items: [],
    puntajeTotal: 0,
  };
}

export function idNivelOfimaticaBasico(niveles: NivelOfimaticaCatalogo[]): string {
  return (
    niveles.find(
      (item) => item.codigo.trim().toUpperCase() === CODIGO_NIVEL_OFIMATICA_BASICO
    )?.id ?? ''
  );
}

/** Puntaje 0.000: el servidor dejó la línea en cero porque el nivel ya estaba registrado. */
export function etiquetaEstadoOfimatica(item: Pick<EstudioOfimatica, 'puntaje'>): string {
  const puntaje = Number(item.puntaje);
  if (Number.isFinite(puntaje) && puntaje === 0) {
    return 'Nivel repetido';
  }
  return '—';
}

/** Suma de filas con el tope del subtotal. Referencia local si la ficha no trae el código E6. */
export function puntajeSubrubroOfimatica(items: Pick<EstudioOfimatica, 'puntaje'>[]): number {
  const suma = items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
  const topado = Math.min(TOPE_PUNTAJE_OFIMATICA, suma);
  return Math.round(topado * 1000) / 1000;
}

/** Fecha de obtención descendente. El empate conserva el orden del API. */
export function ordenarOfimatica(items: EstudioOfimatica[]): EstudioOfimatica[] {
  return [...items].sort((a, b) => b.fechaObtencion.localeCompare(a.fechaObtencion));
}
