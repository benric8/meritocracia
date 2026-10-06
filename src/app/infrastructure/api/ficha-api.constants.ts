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
  GRADOS_TITULOS: 'fichas-grados-titulos',
  gradoTituloPorId: (idGradoTitulo: string | number) =>
    `fichas-grados-titulos/${encodeURIComponent(String(idGradoTitulo).trim())}`,
  AMAG: 'fichas-estudios-amag',
  estudioAmagPorId: (idEstudioAmag: string | number) =>
    `fichas-estudios-amag/${encodeURIComponent(String(idEstudioAmag).trim())}`,
  ESTUDIOS_IDIOMA: 'fichas-estudios-idioma',
  estudioIdiomaPorId: (idEstudioIdioma: string | number) =>
    `fichas-estudios-idioma/${encodeURIComponent(String(idEstudioIdioma).trim())}`,
  PUBLICACIONES_JURIDICAS: 'fichas-publicaciones-juridicas',
  publicacionJuridicaPorId: (idPublicacion: string | number) =>
    `fichas-publicaciones-juridicas/${encodeURIComponent(String(idPublicacion).trim())}`,
  DISTINCIONES: 'fichas-distinciones',
  distincionPorId: (idDistincion: string | number) =>
    `fichas-distinciones/${encodeURIComponent(String(idDistincion).trim())}`,
  DOCENCIA: 'fichas-docencia',
  docenciaPorId: (idDocencia: string | number) =>
    `fichas-docencia/${encodeURIComponent(String(idDocencia).trim())}`,
  DEMERITOS: 'fichas-demeritos',
  demeritoPorId: (idDemerito: string | number) =>
    `fichas-demeritos/${encodeURIComponent(String(idDemerito).trim())}`,
  ESTUDIOS_POSGRADO: 'fichas-estudios-posgrado',
  estudioPosgradoPorId: (idEstudioPosgrado: string | number) =>
    `fichas-estudios-posgrado/${encodeURIComponent(String(idEstudioPosgrado).trim())}`,
  PASANTIAS: 'fichas-pasantias',
  pasantiaPorId: (idPasantia: string | number) =>
    `fichas-pasantias/${encodeURIComponent(String(idPasantia).trim())}`,
  CURSOS_ESPECIALIZACION: 'fichas-cursos-especializacion',
  cursoEspecializacionPorId: (idCursoEspecializacion: string | number) =>
    `fichas-cursos-especializacion/${encodeURIComponent(String(idCursoEspecializacion).trim())}`,
  CERTAMENES_ACADEMICOS: 'fichas-certamenes-academicos',
  certamenAcademicoPorId: (idCertamenAcademico: string | number) =>
    `fichas-certamenes-academicos/${encodeURIComponent(String(idCertamenAcademico).trim())}`,
  ASISTENCIAS_EVENTOS: 'fichas-asistencias-eventos',
  asistenciaEventoPorId: (idAsistenciaEvento: string | number) =>
    `fichas-asistencias-eventos/${encodeURIComponent(String(idAsistenciaEvento).trim())}`,
  OFIMATICA: 'fichas-ofimatica',
  ofimaticaPorId: (idOfimatica: string | number) =>
    `fichas-ofimatica/${encodeURIComponent(String(idOfimatica).trim())}`,
} as const;
