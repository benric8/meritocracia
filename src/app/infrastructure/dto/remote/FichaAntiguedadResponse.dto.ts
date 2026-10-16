import { BaseResponse } from './BaseResponse,dto';

export interface GuardarTitularidadRequestDto {
  distritoJudicialId: number;
  cargoMagistradoId: number;
  fechaJuramentacion: string;
  horaJuramentacion: string;
  fechaCese: string | null;
  fechaReincorporacion: string | null;
  primeraEspecialidadId: number;
  segundaEspecialidadId: number | null;
  fichaValoracionId: number;
}

export interface GuardarTitularidadDataDto {
  idFichaAntiguedad: number;
  idFichaValoracion: number;
  idDistritoJudicial: number;
  idCargoMagistrado: number;
  fechaJuramentacion: string;
  horaJuramentacion: string;
  fechaCese: string | null;
  fechaReincorporacion: string | null;
  idPrimeraEspecialidad: number;
  idSegundaEspecialidad: number | null;
  anios: number;
  meses: number;
  dias: number;
  puntaje: number;
}

export interface GuardarTitularidadResponse extends BaseResponse {
  data: GuardarTitularidadDataDto;
}

export interface GuardarPeriodoInmediatoRequestDto {
  idFichaAntiguedad: number;
  nivelMagistradoAnteriorId: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface GuardarPeriodoInmediatoDataDto {
  idPeriodoInmediato: number;
  idFichaAntiguedad: number;
  nivelMagistradoAnteriorId: number;
  idDistritoJudicial?: number;
  fechaInicio: string;
  fechaFin: string;
  anios: number;
  meses: number;
  dias: number;
}

export interface GuardarPeriodoInmediatoResponse extends BaseResponse {
  data: GuardarPeriodoInmediatoDataDto;
}

export interface GuardarProvisionalidadRequestDto {
  idFichaAntiguedad: number;
  nivelMagistradoProvisionalId: number;
  fechaInicio: string;
  fechaFin: string | null;
  documentoSustentatorio: string | null;
  organoJurisdiccional: string | null;
}

/** POST 201 y PUT 200: acuse de éxito, sin el registro. La lista se vuelve a consultar con el GET. */
export interface GuardarProvisionalidadResponse extends BaseResponse {
  data?: unknown;
}

export interface GuardarColegiaturaRequestDto {
  idFichaAntiguedad: number;
  colegioProfesionalId: number;
  fechaInicio: string;
}

/** POST 201 y PUT 200: acuse de éxito, sin el registro. La lista se vuelve a consultar con el GET. */
export interface GuardarColegiaturaResponse extends BaseResponse {
  data?: unknown;
}

/** Respuesta de GET /fichas-antiguedad?ficha_valoracion_id=&registrador_id=. */
export interface AntiguedadDetalleDto {
  idFichaAntiguedad: number;
  idFichaValoracion: number;
  idDistritoJudicial: number;
  idCargoMagistrado: number;
  fechaJuramentacion: string;
  horaJuramentacion: string;
  fechaCese: string | null;
  fechaReincorporacion: string | null;
  idPrimeraEspecialidad: number;
  idSegundaEspecialidad: number | null;
  anios: number;
  meses: number;
  dias: number;
  puntaje: number;
}

export interface PeriodoInmediatoDetalleDto {
  idPeriodoInmediato: number;
  idFichaAntiguedad: number;
  nivelMagistradoAnteriorId: number;
  idDistritoJudicial?: number;
  fechaInicio: string;
  fechaFin: string;
  anios: number;
  meses: number;
  dias: number;
}

/** Ítem de `GET fichas-antiguedad/provisionalidad` (`ProvisionalidadVigenteResponse`). */
export interface ProvisionalidadDetalleDto {
  idProvisionalidad: number;
  idFichaAntiguedad: number;
  nivelMagistradoProvisionalId: number;
  nivelMagistradoProvisionalDescripcion: string | null;
  fechaInicio: string;
  fechaFin: string | null;
  anios: number;
  meses: number;
  dias: number;
  organoJurisdiccional: string | null;
  documentoSustentatorio: string | null;
}

/** Suma normalizada calculada por el servidor (`SumaTiempoResponse`). */
export interface SumaTiempoDto {
  anios: number;
  meses: number;
  dias: number;
}

export interface ObtenerProvisionalidadesDataDto {
  provisionalidades: ProvisionalidadDetalleDto[];
  suma: SumaTiempoDto | null;
}

export interface ObtenerProvisionalidadesResponse extends BaseResponse {
  data: ObtenerProvisionalidadesDataDto;
}

export interface ColegioProfesionalDetalleDto {
  colegioProfesionalId: number;
  descripcion: string | null;
}

/** Ítem de `GET fichas-antiguedad/colegiatura` (`ColegiaturaVigenteResponse`). */
export interface ColegiaturaDetalleDto {
  idColegiatura: number;
  idFichaAntiguedad: number;
  colegioProfesional: ColegioProfesionalDetalleDto | null;
  fechaInicio: string;
  /** Años completos hasta la fecha de valoración; 0 si no hay fecha vigente. */
  anios: number;
}

export interface ObtenerColegiaturasDataDto {
  colegiaturas: ColegiaturaDetalleDto[];
}

export interface ObtenerColegiaturasResponse extends BaseResponse {
  data: ObtenerColegiaturasDataDto;
}

export interface ObtenerAntiguedadDataDto {
  antiguedad: AntiguedadDetalleDto | null;
  periodoInmediato: PeriodoInmediatoDetalleDto | null;
}

export interface ObtenerAntiguedadResponse extends BaseResponse {
  data: ObtenerAntiguedadDataDto;
}

/** DELETE provisionalidad/colegiatura: acuse de éxito. La lista se vuelve a consultar con el GET. */
export interface EliminarAntiguedadItemResponse extends BaseResponse {
  data?: unknown;
}
