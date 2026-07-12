/** Endpoints de gestión de usuarios (relativos a environment.urlApi). */
export const usuariosEndpoints = {
  LISTAR: 'usuarios',
  REGISTRAR: 'usuarios',
  RESETEAR_CLAVE: (id: string) => `usuarios/resetear-clave/${id}`,
  DESACTIVAR: (id: string) => `usuarios/desactivar/${id}`,
} as const;
