/** Endpoints de ficha de valoración (relativos a `getAppConfig().urlApi`). */
export const fichaEndpoints = {
  FLUJO: 'fichas/flujo',
  CREAR: 'fichas',
  ANTIGUEDAD: 'fichas-antiguedad',
  PERIODO_INMEDIATO: 'fichas-antiguedad/periodo-inmediato',
  PROVISIONALIDAD: 'fichas-antiguedad/provisionalidad',
  COLEGIATURA: 'fichas-antiguedad/colegiatura',
} as const;
