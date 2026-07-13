/** Endpoints de documentos institucionales (relativos a `getAppConfig().urlApi`). */
export const documentosInstitucionalesEndpoints = {
  LISTAR: 'documentos',
  SUBIR: 'documentos',
  REEMPLAZAR: (id: string) => `documentos/${id}`,
  DESCARGAR: (id: string) => `documentos/descargar/${id}`,
} as const;
