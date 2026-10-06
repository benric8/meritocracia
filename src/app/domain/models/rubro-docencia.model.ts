/**
 * Rubro I — Docencia universitaria (RF006).
 * El puntaje de cada línea lo calcula el servidor. El subtotal del rubro
 * llega topado en GET /fichas/{id} y no en el listado de líneas.
 */

export type OrdenJuridicoDocencia = 'JURIDICO' | 'NO JURIDICO';

export type TipoDocumentoDocencia =
  | 'CARTA'
  | 'CERTIFICADO'
  | 'CONSTANCIA'
  | 'CONTRATO'
  | 'DECLARACION_JURADA'
  | 'OFICIO'
  | 'REPORTE'
  | 'OTROS';

export interface DocenciaUniversitaria {
  id: string;
  descripcionDocumento: string;
  universidad: string;
  horasSemanales: number;
  fechaInicio: string;
  fechaFin: string;
  ordenJuridico: OrdenJuridicoDocencia;
  especialidad: string;
  materia: string;
  categoria: string;
  condicion: string;
  archivoId: string | null;
  /** Puntaje de la fila. Puede superar el tope del rubro. */
  puntaje: number;
}

export interface RubroDocencia {
  items: DocenciaUniversitaria[];
  /** Subtotal del acordeón, topado por el servidor. */
  puntajeTotal: number;
}

export const TOPE_PUNTAJE_RUBRO_DOCENCIA = 3;

export const LIMITES_DOCENCIA = {
  universidad: 200,
  materia: 150,
  especialidad: 150,
  categoria: 50,
  condicion: 50,
} as const;

export const OPCIONES_ORDEN_JURIDICO_DOCENCIA: {
  valor: OrdenJuridicoDocencia;
  etiqueta: string;
}[] = [
  { valor: 'JURIDICO', etiqueta: 'Jurídico' },
  { valor: 'NO JURIDICO', etiqueta: 'No jurídico' },
];

export const TIPOS_DOCUMENTO_DOCENCIA: { valor: TipoDocumentoDocencia; etiqueta: string }[] = [
  { valor: 'CARTA', etiqueta: 'Carta' },
  { valor: 'CERTIFICADO', etiqueta: 'Certificado' },
  { valor: 'CONSTANCIA', etiqueta: 'Constancia' },
  { valor: 'CONTRATO', etiqueta: 'Contrato' },
  { valor: 'DECLARACION_JURADA', etiqueta: 'Declaración jurada' },
  { valor: 'OFICIO', etiqueta: 'Oficio' },
  { valor: 'REPORTE', etiqueta: 'Reporte' },
  { valor: 'OTROS', etiqueta: 'Otros' },
];

export function crearRubroDocenciaVacio(): RubroDocencia {
  return {
    items: [],
    puntajeTotal: 0,
  };
}
