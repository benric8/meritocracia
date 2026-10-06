/** Endpoints de fecha de valoración (relativos a `getAppConfig().urlApi`). */
export const fechaValoracionEndpoints = {
  VIGENTE: 'fechas-valoracion/vigente',
  HISTORIAL: 'fechas-valoracion',
  REGISTRAR: 'fechas-valoracion',
  DESACTIVAR: (id: string) => `fechas-valoracion/${id}/inactivar`,
} as const;
