/** Tipo de documento publicado en Inicio (RF003). */
export type TipoDocumentoInstitucional = 'RESOLUCION' | 'LINEAMIENTO';

export interface DocumentoInstitucional {
  id: string;
  tipo: TipoDocumentoInstitucional;
  nombreArchivo: string;
  fechaPublicacion: string;
  usuarioPublicacion: string;
}

export interface SubirDocumentoPeticion {
  nombre: string;
  tipo: TipoDocumentoInstitucional;
  archivo: File;
}

export const ETIQUETAS_TIPO_DOCUMENTO: Record<TipoDocumentoInstitucional, string> = {
  RESOLUCION: 'Resolución',
  LINEAMIENTO: 'Lineamiento',
};
