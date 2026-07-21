import { BaseResponse } from './BaseResponse,dto';

export interface GuardarEstudioAmagRequestDto {
  fichaValoracionId?: number;
  tipoCurso: number;
  nota: number;
  descripcion: string;
  anio: number;
}

export interface EstudioAmagDetalleDto {
  idMagistratura: number;
  fichaValoracionId: number;
  tipoCurso: number;
  nota: number;
  descripcion: string;
  anio: number;
  puntaje: number;
}

export interface ObtenerEstudiosAmagDataDto {
  estudiosAmag: EstudioAmagDetalleDto[];
  puntajeTotal?: number;
}

export interface ObtenerEstudiosAmagResponse extends BaseResponse {
  data: ObtenerEstudiosAmagDataDto | EstudioAmagDetalleDto[];
}

export interface GuardarEstudioAmagResponse extends BaseResponse {
  data: EstudioAmagDetalleDto;
}

export interface EliminarEstudioAmagResponse extends BaseResponse {
  data?: ObtenerEstudiosAmagDataDto | null;
}
