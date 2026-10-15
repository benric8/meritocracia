import { BaseResponse } from './BaseResponse,dto';

export interface GuardarEstudioAmagRequestDto {
  fichaValoracionId?: number;
  rubroId?: number;
  cursoAmagId: number;
  nota: number;
  descripcion: string;
  anio: number;
  archivoId?: number | null;
}

/** Ítem de `GET fichas-estudios-amag` (`EstudioAmagResponse`). */
export interface EstudioAmagDetalleDto {
  idEstudioAmag: number;
  cursoAmagId: number;
  cursoAmagNombre?: string | null;
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

/** POST 201 y PUT 200: acuse de éxito, sin el registro ni la lista. */
export interface GuardarEstudioAmagResponse extends BaseResponse {
  data?: unknown;
}

/** DELETE 200: acuse de éxito. La lista vigente se vuelve a consultar con el GET. */
export interface EliminarEstudioAmagResponse extends BaseResponse {
  data?: unknown;
}
