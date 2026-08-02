/**
 * Rubro H — Distinciones y condecoraciones (RF006).
 */

export interface Distincion {
  id: string;
  tipoDistincionId: string;
  tipoDistincionNombre: string;
  tipoDistincionCodigo: string;
  tipoDocumentoDistincionId: string;
  tipoDocumentoDistincionNombre: string;
  descripcion: string;
  fechaDistincion: string;
  institucionOtorgante: string;
  paisId: string;
  paisNombre: string;
  archivoId: string | null;
  puntaje: number;
}

export interface RubroDistincion {
  items: Distincion[];
  puntajeTotal: number;
}

export interface TipoDistincionCatalogoItem {
  id: string;
  nombre: string;
  codigo: string;
}

export const PUNTAJE_REFERENCIA_TIPO_DISTINCION: Record<string, string> = {
  RECONOCIMIENTO_JUDICIAL: '0.50 pts c/u',
  CARGO_DIRECTIVO: '1.00 pt por elección',
  RESPONSABLE_ODECMA: '0.50 pts c/u',
  NO_SANCIONES: '1.00 pt c/u (máx. 1 por año calendario)',
};

export const TOPE_PUNTAJE_RUBRO_DISTINCION = 3;

export function crearRubroDistincionVacio(): RubroDistincion {
  return {
    items: [],
    puntajeTotal: 0,
  };
}
