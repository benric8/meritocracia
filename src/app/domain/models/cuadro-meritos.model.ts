export type EstadoCarreraCuadro = 'ACTIVO' | 'CESANTE' | '';

/** Filtros del Anexo 02; vacío = no se envía el parámetro. */
export interface FiltrosCuadroMeritos {
  idFechaValoracion: string;
  idDistritoJudicial: string;
  idEspecialidad: string;
  /** Exactamente 8 dígitos. */
  dni: string;
  /** Máximo 150 caracteres; el backend busca por coincidencia parcial. */
  apellidosNombres: string;
  estadoCarrera: EstadoCarreraCuadro;
}

export const FILTROS_CUADRO_MERITOS_VACIOS: FiltrosCuadroMeritos = {
  idFechaValoracion: '',
  idDistritoJudicial: '',
  idEspecialidad: '',
  dni: '',
  apellidosNombres: '',
  estadoCarrera: '',
};

export const DNI_CUADRO_MERITOS_PATRON = /^\d{8}$/;
export const APELLIDOS_NOMBRES_MAX_LENGTH = 150;

/** Puntajes ya redondeados a 3 decimales por el backend; nunca `null` (sin registros = 0). */
export interface FilaCuadroMeritos {
  /** Posición nacional: no se renumera al filtrar ni al paginar. */
  orden: number;
  idMagistrado: string;
  idFichaValoracion: string;
  dni: string;
  apellidosNombres: string;
  cesante: boolean;
  distritoJudicial: string | null;
  primeraEspecialidad: string | null;
  segundaEspecialidad: string | null;
  puntajeAntiguedad: number;
  puntajeGradosTitulos: number;
  puntajeEstudiosAmag: number;
  puntajeDoctoradoMaestria: number;
  puntajePasantias: number;
  puntajeCursos: number;
  puntajeExpositor: number;
  puntajeAsistenciaEventos: number;
  puntajeOfimatica: number;
  puntajeIdiomas: number;
  puntajePerfeccionamiento: number;
  puntajePublicaciones: number;
  puntajeDistinciones: number;
  puntajeDocencia: number;
  /** Cero o negativo. */
  puntajeDemeritos: number;
  puntajeTotal: number;
  criterioI: number;
  /** Cero o negativo (Rubro IX). */
  criterioII: number;
  /** N° en el Cuadro de Antigüedad; `null` sin ficha de antigüedad. */
  criterioIII: number | null;
}

/** Cuadro de Méritos de Jueces Superiores Titulares (RF007 — Submenú C, Anexo 02). */
export interface CuadroMeritos {
  idFechaValoracion: string;
  fechaValoracion: string;
  puntajeMaximo: number;
  /** Nota de Producción Jurisdiccional suspendida (siempre al pie y en el tooltip). */
  notaProduccion: string;
  /** Solo cuando alguna fila es de un cesante. */
  notaCesantes: string | null;
  filas: FilaCuadroMeritos[];
}
