/**
 * Rubro D — Estudios de preparación AMAG (RF006).
 */

export interface EstudioAmag {
  id: string;
  tipoCursoId: string;
  tipoCursoNombre: string;
  nota: number;
  descripcion: string;
  anio: number;
  puntaje: number;
}

export interface RubroAmag {
  items: EstudioAmag[];
  puntajeTotal: number;
}

export function crearRubroAmagVacio(): RubroAmag {
  return {
    items: [],
    puntajeTotal: 0,
  };
}
