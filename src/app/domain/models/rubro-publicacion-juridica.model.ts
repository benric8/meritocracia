/**
 * Rubro G — Publicaciones de índole jurídico (RF006).
 */

export type OrdenJuridico = 'JURIDICO' | 'NO JURIDICO';

export interface PublicacionJuridica {
  id: string;
  tipoPublicacionId: string;
  tipoPublicacionNombre: string;
  titulo: string;
  editorial: string;
  paginas: number;
  numEdicion: string;
  auspicio: string;
  paisId: string;
  paisNombre: string;
  ordenJuridico: OrdenJuridico;
  especialidad: string;
  institucionId: string;
  institucionNombre: string;
  fechaPublicacion: string;
  premiada: boolean;
  archivoId: string | null;
  puntaje: number;
}

export interface RubroPublicacionJuridica {
  items: PublicacionJuridica[];
  puntajeTotal: number;
}

export const OPCIONES_ORDEN_JURIDICO: { valor: OrdenJuridico; etiqueta: string }[] = [
  { valor: 'JURIDICO', etiqueta: 'Jurídico' },
  { valor: 'NO JURIDICO', etiqueta: 'No jurídico' },
];

export const OPCIONES_PREMIADA: { valor: boolean; etiqueta: string }[] = [
  { valor: false, etiqueta: 'No' },
  { valor: true, etiqueta: 'Sí' },
];

export function crearRubroPublicacionJuridicaVacio(): RubroPublicacionJuridica {
  return {
    items: [],
    puntajeTotal: 0,
  };
}
