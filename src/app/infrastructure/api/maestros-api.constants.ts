/** Endpoints de catálogos maestros (relativos a `getAppConfig().urlApi`). */
export const maestrosEndpoints = {
  NIVELES_TITULAR: 'maestros/nivel/titular',
  CARGOS_MAGISTRADO_EVALUADAS: 'maestros/cargos-magistrado/evaluadas',
  CARGO_MAGISTRADO: (id: string) => `maestros/cargos-magistrado/${id}`,
  CARGO_MAGISTRADO_PROVISIONALIDAD: (id: string) =>
    `maestros/cargos-magistrado/${id}/provisionalidad`,
  CARGO_MAGISTRADO_ANTERIOR: (id: string) => `maestros/cargos-magistrado/${id}/anterior`,
  COLEGIOS_PROFESIONALES: 'maestros/colegios-profesionales',
  ESPECIALIDADES: 'maestros/especialidades',
  DISTRITO_JUDICIAL: 'maestros/distrito-judicial',
  NIVEL_GRADO: 'maestros/nivel-grado',
  UNIVERSIDADES: 'maestros/universidades',
  PAISES: 'maestros/paises',
  TIPO_CURSO_AMAG: 'maestros/tipo-curso-amag',
} as const;
