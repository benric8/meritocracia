/** Endpoints futuros de documentos institucionales (relativos a environment.urlApi). */
export const documentosInstitucionalesEndpoints = {
  LISTAR: 'inicio/documentos',
  SUBIR: 'inicio/documentos',
  REEMPLAZAR: (id: string) => `inicio/documentos/${id}`,
  DESCARGAR: (id: string) => `inicio/documentos/${id}/descargar`,
} as const;
