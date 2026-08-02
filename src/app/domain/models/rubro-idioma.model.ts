/**
 * Rubro F — Idioma nativo o extranjero (RF006).
 */

export type TipoIdioma = 'NATIVO' | 'EXTRANJERO';

export interface IdiomaCatalogoItem {
  id: string;
  nombre: string;
  tipo: TipoIdioma;
}

export interface EstudioIdioma {
  id: string;
  idiomaId: string;
  idiomaNombre: string;
  idiomaTipo: TipoIdioma | '';
  nivelIdiomaId: string;
  nivelIdiomaNombre: string;
  tipoDocumentoIdiomaId: string;
  tipoDocumentoNombre: string;
  institucionId: string;
  institucionNombre: string;
  fechaObtencion: string;
  archivoId: string | null;
  puntaje: number;
}

export interface RubroIdioma {
  items: EstudioIdioma[];
  puntajeTotal: number;
}

export function crearRubroIdiomaVacio(): RubroIdioma {
  return {
    items: [],
    puntajeTotal: 0,
  };
}
