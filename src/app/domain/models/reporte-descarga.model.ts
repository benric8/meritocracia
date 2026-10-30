/** Formatos de descarga de los cuadros de Reportes (Anexos 01 y 02). */
export type FormatoDescargaCuadro = 'excel' | 'pdf';

export interface ArchivoDescargado {
  nombre: string;
  contenido: Blob;
}
