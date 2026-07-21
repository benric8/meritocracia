/**
 * Rubro C — Grados académicos y títulos profesionales (RF006).
 */

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
