/**
 * Rubro J — Deméritos (RF006).
 * El puntaje de cada línea lo calcula el servidor. El subtotal del rubro
 * es la suma de las líneas y llega en GET /fichas/{id}, no en el listado.
 */

export type TipoMedidaDemerito = 'AMONESTACION' | 'MULTA' | 'SUSPENSION';

export type TipoDocumentoDemerito =
  | 'CARTA'
  | 'CERTIFICADO'
  | 'CONSTANCIA'
  | 'CONTRATO'
  | 'DECLARACION_JURADA'
  | 'OFICIO'
  | 'REPORTE'
  | 'OTROS';

export interface Demerito {
  id: string;
  tipoMedida: TipoMedidaDemerito;
  cantidad: number;
  descripcionDocumento: string;
  /** Año que calcula el servidor con la fecha de valoración de la ficha. No se envía. */
  anioValoracion: number;
  observacion: string;
  archivoId: string | null;
  /** Puntaje de la fila. Puede ser 0 si el año no coincide con la valoración. */
  puntaje: number;
}

export interface RubroDemerito {
  items: Demerito[];
  /** Suma de las líneas. Resta del total de la ficha y no tiene tope. */
  puntajeTotal: number;
}

export const LIMITE_OBSERVACION_DEMERITO = 300;

export const OPCIONES_TIPO_MEDIDA: {
  valor: TipoMedidaDemerito;
  etiqueta: string;
  referencia: string;
}[] = [
  { valor: 'AMONESTACION', etiqueta: 'Amonestación', referencia: '-0.50 por sanción' },
  { valor: 'MULTA', etiqueta: 'Multa', referencia: '-1.00 por sanción' },
  { valor: 'SUSPENSION', etiqueta: 'Suspensión', referencia: '-2.00 por sanción' },
];

export const TIPOS_DOCUMENTO_DEMERITO: { valor: TipoDocumentoDemerito; etiqueta: string }[] = [
  { valor: 'CARTA', etiqueta: 'Carta' },
  { valor: 'CERTIFICADO', etiqueta: 'Certificado' },
  { valor: 'CONSTANCIA', etiqueta: 'Constancia' },
  { valor: 'CONTRATO', etiqueta: 'Contrato' },
  { valor: 'DECLARACION_JURADA', etiqueta: 'Declaración jurada' },
  { valor: 'OFICIO', etiqueta: 'Oficio' },
  { valor: 'REPORTE', etiqueta: 'Reporte' },
  { valor: 'OTROS', etiqueta: 'Otros' },
];

export function crearRubroDemeritoVacio(): RubroDemerito {
  return {
    items: [],
    puntajeTotal: 0,
  };
}
