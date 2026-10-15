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

/** Ítem de `GET fichas-docencia` (`DocenciaResponse`). */
export interface DocenciaDetalleDto {
  idDocencia: number;
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

export interface ObtenerDocenciasDataDto {
  docencias: DocenciaDetalleDto[];
  puntajeTotal?: number;
}

export interface ObtenerDocenciasResponse extends BaseResponse {
  data: ObtenerDocenciasDataDto | DocenciaDetalleDto[];
}

/** POST 201 y PUT 200: acuse de éxito, sin el registro ni la lista. */
export interface GuardarDocenciaResponse extends BaseResponse {
  data?: unknown;
}

/** DELETE 200: acuse de éxito. La lista vigente se vuelve a consultar con el GET. */
export interface EliminarDocenciaResponse extends BaseResponse {
  data?: unknown;
}
