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
  cargoAntiguedadId: number;
  nivelMagistradoAnteriorId: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface GuardarPeriodoInmediatoDataDto {
  idPeriodoInmediato: number;
  cargoAntiguedadId: number;
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
  cargoAntiguedadId: number;
  nivelMagistradoProvisionalId: number;
  fechaInicio: string;
  fechaFin: string;
  documentoSustentatorio: string;
  organoJurisdiccional: string;
}

export interface GuardarProvisionalidadDataDto {
  idProvisionalidad: number;
  cargoAntiguedadId: number;
  nivelMagistradoProvisionalId: number;
  idDistritoJudicial?: number;
  fechaInicio: string;
  fechaFin: string;
  anios: number;
  meses: number;
  dias: number;
  documentoSustentatorio: string;
  organoJurisdiccional: string;
}

export interface GuardarProvisionalidadResponse extends BaseResponse {
  data: GuardarProvisionalidadDataDto;
}

export interface GuardarColegiaturaRequestDto {
  cargoAntiguedadId: number;
  colegioProfesionalId: number;
  fechaInicio: string;
}

export interface GuardarColegiaturaDataDto {
  idColegiatura: number;
  cargoAntiguedadId: number;
  colegioProfesionalId: number;
  fechaInicio: string;
  anios: number;
  meses: number;
  dias: number;
}

export interface GuardarColegiaturaResponse extends BaseResponse {
  data: GuardarColegiaturaDataDto;
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
  cargoAntiguedadId: number;
  nivelMagistradoAnteriorId: number;
  idDistritoJudicial?: number;
  fechaInicio: string;
  fechaFin: string;
  anios: number;
  meses: number;
  dias: number;
}

export interface ProvisionalidadDetalleDto {
  idProvisionalidad: number;
  cargoAntiguedadId: number;
  nivelMagistradoProvisionalId: number;
  idDistritoJudicial?: number;
  fechaInicio: string;
  fechaFin: string;
  anios: number;
  meses: number;
  dias: number;
  documentoSustentatorio: string;
  organoJurisdiccional: string;
}

export interface ColegiaturaDetalleDto {
  idColegiatura: number;
  cargoAntiguedadId: number;
  colegioProfesionalId: number;
  fechaInicio: string;
  anios: number;
  meses: number;
  dias: number;
}

export interface ObtenerAntiguedadDataDto {
  antiguedad: AntiguedadDetalleDto | null;
  periodoInmediato: PeriodoInmediatoDetalleDto | null;
  provisionalidades: ProvisionalidadDetalleDto[];
  colegiaturas: ColegiaturaDetalleDto[];
}

export interface ObtenerAntiguedadResponse extends BaseResponse {
  data: ObtenerAntiguedadDataDto;
}
