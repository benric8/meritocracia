import { BaseResponse } from './BaseResponse,dto';

export interface GuardarDocenciaRequestDto {
  fichaValoracionId?: number;
  rubroId: number;
  descripcionDocumento: string;
  universidad: string;
  horasSemanales: number;
  fechaInicio: string;
  fechaFin: string;
  ordenJuridico: string;
  especialidad?: string | null;
  materia: string;
  categoria?: string | null;
  condicion?: string | null;
  archivoId?: number | null;
}

export interface DocenciaDetalleDto {
  idDocencia?: number;
  id?: number;
  idFichaValoracion?: number;
  descripcionDocumento: string;
  universidad: string;
  horasSemanales: number;
  fechaInicio: string;
  fechaFin: string;
  ordenJuridico: string;
  especialidad?: string | null;
  materia: string;
  categoria?: string | null;
  condicion?: string | null;
  archivoId?: number | null;
  puntaje: number;
}

export interface ObtenerDocenciasResponse extends BaseResponse {
  data: DocenciaDetalleDto[];
}

export interface GuardarDocenciaResponse extends BaseResponse {
  data: DocenciaDetalleDto;
}

export interface EliminarDocenciaResponse extends BaseResponse {
  data?: DocenciaDetalleDto[] | null;
}
