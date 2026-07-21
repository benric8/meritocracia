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
  fechaFin: string;
  documentoSustentatorio: string;
  organoJurisdiccional: string;
}

export interface GuardarProvisionalidadDataDto {
  idProvisionalidad: number;
  idFichaAntiguedad: number;
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
  idFichaAntiguedad: number;
  colegioProfesionalId: number;
  fechaInicio: string;
}

export interface GuardarColegiaturaDataDto {
  idColegiatura: number;
  idFichaAntiguedad: number;
  colegioProfesional: ColegioProfesionalDetalleDto;
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
  idFichaAntiguedad: number;
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
  idFichaAntiguedad: number;
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

export interface ColegioProfesionalDetalleDto {
  colegioProfesionalId: number;
  descripcion: string | null;
}

export interface ColegiaturaDetalleDto {
  idColegiatura: number;
  idFichaAntiguedad: number;
  colegioProfesional: ColegioProfesionalDetalleDto;
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

/** DELETE provisionalidad/colegiatura: puede devolver el rubro actualizado o solo éxito. */
export interface EliminarAntiguedadItemResponse extends BaseResponse {
  data?: ObtenerAntiguedadDataDto | null;
}
