/** Endpoints de juez / SIGA (relativos a `getAppConfig().urlApi`). */
export const juezEndpoints = {
  /** Consulta de nombre completo y foto por DNI. */
  DATOS_SIGA: 'jueces/siga',
  /** Edad calculada con fecha de nacimiento y fecha de valoración vigente. */
  EDAD: 'juez/edad',
} as const;
