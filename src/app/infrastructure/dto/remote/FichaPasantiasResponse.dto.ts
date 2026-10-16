import { BaseResponse } from './BaseResponse,dto';

export interface GuardarPasantiaRequestDto {
  fichaValoracionId?: number;
  rubroId: number;
  tipoPasantiaId: number;
  institucionId: number;
  paisId: number;
  fechaInicio: string;
  fechaFin: string;
  juridico: '1' | '0';
  especialidadId: number;
  mencion: string;
  archivoId: number | null;
}

export interface PasantiaDetalleDto {
  idPasantia: number;
  idFichaValoracion?: number;
  tipoPasantiaId: number;
  tipoPasantiaDescripcion?: string | null;
  institucionId: number;
  institucionNombre?: string | null;
  paisId: number;
  paisNombre?: string | null;
  fechaInicio: string;
  fechaFin: string;
  juridico: string;
  especialidadId: number;
  especialidadDescripcion?: string | null;
  mencion?: string | null;
  archivoId?: number | null;
  puntaje: number;
}

export interface ObtenerPasantiasDataDto {
  pasantias: PasantiaDetalleDto[];
  puntajeTotal?: number;
}

export interface ObtenerPasantiasResponse extends BaseResponse {
  data: ObtenerPasantiasDataDto | PasantiaDetalleDto[];
}

/** POST 201 y PUT 200: acuse de éxito, sin el registro ni la lista. */
export interface GuardarPasantiaResponse extends BaseResponse {
  data?: unknown;
}

/** DELETE 200: acuse de éxito. La lista vigente se vuelve a consultar con el GET. */
export interface EliminarPasantiaResponse extends BaseResponse {
  data?: unknown;
}
