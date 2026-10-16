import { BaseResponse } from './BaseResponse,dto';

export interface GuardarEstudioPosgradoRequestDto {
  fichaValoracionId?: number;
  rubroId: number;
  institucionId: number;
  paisId: number;
  especialidad: string;
  mencion: string;
  condicionAcademica: string;
  numeroSemestre: number;
  anioInicio: number;
  anioFin: number;
  notas: number[];
}

/** Ítem de `GET fichas-estudios-posgrado` (`EstudioPosgradoResponse`). */
export interface EstudioPosgradoDetalleDto {
  idEstudioPosgrado: number;
  institucionId: number;
  /** Nombre de la universidad. Solo viene en la respuesta. */
  institucion?: string | null;
  paisId: number;
  paisNombre?: string | null;
  especialidad: string;
  mencion: string;
  condicionAcademica: string;
  numeroSemestre: number;
  anioInicio: number;
  anioFin: number;
  notas?: number[] | null;
  promedio?: number | null;
  puntaje: number;
}

export interface ObtenerEstudiosPosgradoDataDto {
  estudiosPosgrado: EstudioPosgradoDetalleDto[];
  puntajeTotal?: number;
}

export interface ObtenerEstudiosPosgradoResponse extends BaseResponse {
  data: ObtenerEstudiosPosgradoDataDto | EstudioPosgradoDetalleDto[];
}

/** POST 201 y PUT 200: acuse de éxito, sin el registro ni la lista. */
export interface GuardarEstudioPosgradoResponse extends BaseResponse {
  data?: unknown;
}

/** DELETE 200: acuse de éxito. La lista vigente se vuelve a consultar con el GET. */
export interface EliminarEstudioPosgradoResponse extends BaseResponse {
  data?: unknown;
}
