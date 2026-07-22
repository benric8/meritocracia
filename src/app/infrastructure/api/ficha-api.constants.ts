/** Endpoints de ficha de valoración (relativos a `getAppConfig().urlApi`). */
export const fichaEndpoints = {
  FLUJO: 'fichas/flujo',
  CREAR: 'fichas',
  /** GET ficha completa: `fichas/{idFicha}?registrador_id=`. */
  porId: (idFicha: string | number) => `fichas/${encodeURIComponent(String(idFicha).trim())}`,
  ANTIGUEDAD: 'fichas-antiguedad',
  /** PUT titularidad: `fichas-antiguedad/{idFichaAntiguedad}`. */
  antiguedadPorId: (idFichaAntiguedad: string | number) =>
    `fichas-antiguedad/${encodeURIComponent(String(idFichaAntiguedad).trim())}`,
  PERIODO_INMEDIATO: 'fichas-antiguedad/periodo-inmediato',
  /** PUT periodo inmediato: `fichas-antiguedad/periodo-inmediato/{id}`. */
  periodoInmediatoPorId: (idPeriodoInmediato: string | number) =>
    `fichas-antiguedad/periodo-inmediato/${encodeURIComponent(String(idPeriodoInmediato).trim())}`,
  PROVISIONALIDAD: 'fichas-antiguedad/provisionalidad',
  /** PUT provisionalidad: `fichas-antiguedad/provisionalidad/{id}`. */ 
  provisionalidadPorId: (idProvisionalidad: string | number) =>
    `fichas-antiguedad/provisionalidad/${encodeURIComponent(String(idProvisionalidad).trim())}`,
  COLEGIATURA: 'fichas-antiguedad/colegiatura',
  /** PUT colegiatura: `fichas-antiguedad/colegiatura/{id}`. */
  colegiaturaPorId: (idColegiatura: string | number) =>
    `fichas-antiguedad/colegiatura/${encodeURIComponent(String(idColegiatura).trim())}`,
  GRADOS_TITULOS: 'ficha-grados-titulos',
  gradoTituloPorId: (idGradoTitulo: string | number) =>
    `ficha-grados-titulos/${encodeURIComponent(String(idGradoTitulo).trim())}`,
  AMAG: 'ficha-amag',
  estudioAmagPorId: (idEstudioAmag: string | number) =>
    `ficha-amag/${encodeURIComponent(String(idEstudioAmag).trim())}`,
} as const;
