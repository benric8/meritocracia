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

export interface EstudioPosgradoDetalleDto {
  idEstudioPosgrado?: number;
  id?: number;
  idFichaValoracion?: number;
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

export interface ObtenerEstudiosPosgradoResponse extends BaseResponse {
  data: EstudioPosgradoDetalleDto[];
}

export interface GuardarEstudioPosgradoResponse extends BaseResponse {
  data: EstudioPosgradoDetalleDto;
}

export interface EliminarEstudioPosgradoResponse extends BaseResponse {
  data?: null;
}
