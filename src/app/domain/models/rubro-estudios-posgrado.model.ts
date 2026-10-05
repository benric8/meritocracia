/**
 * Rubro E, subrubro E1 — Estudios de doctorado y maestría.
 * Cada registro es un semestre. Promedio y puntaje los calcula el servidor.
 * El total del rubro E es la suma de semestres, con tope 1.500.
 */

export const TOPE_PUNTAJE_ESTUDIOS_POSGRADO = 1.5;
export const ANIO_ESTUDIO_MIN = 1900;
export const ANIO_ESTUDIO_MAX = 2100;
export const SEMESTRE_MINIMO = 1;
export const SEMESTRE_MAXIMO = 20;
export const LIMITE_MENCION_POSGRADO = 150;
export const NOTA_MINIMA = 0;
export const NOTA_MAXIMA = 20;

export type EspecialidadPosgrado = 'JURIDICA' | 'NO JURIDICA';
export type CondicionAcademicaPosgrado = 'INCONCLUSO' | 'CONCLUIDO_SIN_GRADO';

export const OPCIONES_ESPECIALIDAD_POSGRADO: {
  valor: EspecialidadPosgrado;
  etiqueta: string;
}[] = [
  { valor: 'JURIDICA', etiqueta: 'Jurídica' },
  { valor: 'NO JURIDICA', etiqueta: 'No jurídica' },
];

export const OPCIONES_CONDICION_ACADEMICA_POSGRADO: {
  valor: CondicionAcademicaPosgrado;
  etiqueta: string;
}[] = [
  { valor: 'INCONCLUSO', etiqueta: 'Inconcluso' },
  { valor: 'CONCLUIDO_SIN_GRADO', etiqueta: 'Concluido sin grado' },
];

export interface EstudioPosgrado {
  id: string;
  institucionId: string;
  /** Nombre que devuelve el GET en `institucion`. No se envía. */
  institucionNombre: string;
  paisId: string;
  paisNombre: string;
  especialidad: string;
  mencion: string;
  condicionAcademica: string;
  numeroSemestre: number;
  anioInicio: number;
  anioFin: number;
  notas: number[];
  /** Promedio que calcula el servidor. No se envía. */
  promedio: number | null;
  puntaje: number;
}

export interface RubroEstudiosPosgrado {
  items: EstudioPosgrado[];
  puntajeTotal: number;
}

export function crearRubroEstudiosPosgradoVacio(): RubroEstudiosPosgrado {
  return {
    items: [],
    puntajeTotal: 0,
  };
}

export function esPaisPeru(nombre: string | null | undefined): boolean {
  const normalizado = quitarTildes(String(nombre ?? ''))
    .trim()
    .toUpperCase();
  return normalizado === 'PERU' || normalizado.startsWith('PERU ');
}

/** Misma ficha, universidad, mención y número de semestre. */
export function semestrePosgradoDuplicado(
  items: Pick<EstudioPosgrado, 'id' | 'institucionId' | 'mencion' | 'numeroSemestre'>[],
  candidato: Pick<EstudioPosgrado, 'id' | 'institucionId' | 'mencion' | 'numeroSemestre'>
): boolean {
  const mencion = normalizarClave(candidato.mencion);
  const institucionId = String(candidato.institucionId ?? '').trim();
  return items.some(
    (item) =>
      item.id !== candidato.id &&
      String(item.institucionId ?? '').trim() === institucionId &&
      normalizarClave(item.mencion) === mencion &&
      item.numeroSemestre === candidato.numeroSemestre
  );
}

/** Media de las notas desde 11. Referencia visual; el servidor confirma el valor. */
export function promedioNotasAprobadas(notas: number[]): number | null {
  const aprobadas = notas.filter((nota) => Number.isFinite(nota) && nota >= 11);
  if (aprobadas.length === 0) {
    return notas.length ? 0 : null;
  }
  const promedio = aprobadas.reduce((total, nota) => total + nota, 0) / aprobadas.length;
  return Math.round(promedio * 100) / 100;
}

/** Referencia visual. El servidor asigna el puntaje definitivo. */
export function puntajeReferenciaSemestre(notas: number[]): number {
  const promedio = promedioNotasAprobadas(notas);
  if (promedio == null || promedio < 13) {
    return 0;
  }
  if (promedio >= 18.01 && promedio <= NOTA_MAXIMA) {
    return 1;
  }
  if (promedio >= 15 && promedio < 18.01) {
    return 0.75;
  }
  if (promedio >= 13 && promedio < 15) {
    return 0.5;
  }
  return 0;
}

function quitarTildes(valor: string): string {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizarClave(valor: string): string {
  return quitarTildes(String(valor ?? ''))
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}
