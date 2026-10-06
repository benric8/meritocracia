/**
 * Rubro C — Grados académicos y títulos profesionales (RF006).
 */

export const ESPECIALIDAD_JURIDICA = 'JURIDICA';
export const ESPECIALIDAD_NO_JURIDICA = 'NO JURIDICA';

export const ESPECIALIDADES_GRADO_TITULO = [
  ESPECIALIDAD_JURIDICA,
  ESPECIALIDAD_NO_JURIDICA,
] as const;

export type EspecialidadGradoTitulo = (typeof ESPECIALIDADES_GRADO_TITULO)[number];

export function esTituloProfesional(nombreGrado: string): boolean {
  const normalizado = nombreGrado.trim().toLowerCase();
  return normalizado === 'título profesional' || normalizado === 'titulo profesional';
}

export function etiquetaEspecialidadGrado(valor: string): string {
  switch (valor.trim()) {
    case ESPECIALIDAD_JURIDICA:
      return 'Jurídica';
    case ESPECIALIDAD_NO_JURIDICA:
      return 'No jurídica';
    default:
      return valor.trim();
  }
}

export interface GradoTitulo {
  id: string;
  gradoAcademicoId: string;
  gradoAcademicoNombre: string;
  universidadId: string;
  universidadNombre: string;
  paisId: string;
  paisNombre: string;
  fechaObtencion: string;
  especialidad: string;
  mencion: string;
  observacion: string;
  puntaje: number;
}

export interface GradoTituloFormulario {
  gradoAcademicoId: string;
  universidadId: string;
  paisId: string;
  fechaObtencion: string | null;
  especialidad: string;
  mencion: string;
  observacion: string;
}

export interface RubroGradosTitulos {
  items: GradoTitulo[];
  puntajeTotal: number;
}

export function crearRubroGradosTitulosVacio(): RubroGradosTitulos {
  return {
    items: [],
    puntajeTotal: 0,
  };
}
