import { BaseResponse } from './BaseResponse,dto';

export interface GuardarOfimaticaRequestDto {
  fichaValoracionId?: number;
  rubroId: number;
  nombreCurso: string;
  institucionId: number;
  paisId: number;
  duracionHoras: number;
  nivelOfimaticaId: number;
  tipoDocumentoId: number;
  fechaObtencion: string;
  archivoId: number | null;
}

export interface OfimaticaDetalleDto {
  idOfimatica: number;
  idFichaValoracion?: number;
  nombreCurso: string;
  institucionId: number;
  institucionNombre?: string | null;
  paisId: number;
  nombrePais?: string | null;
  duracionHoras: number;
  nivelOfimaticaId: number;
  nivelOfimaticaCodigo?: string | null;
  nivelOfimaticaDescripcion?: string | null;
  tipoDocumentoId: number;
  tipoDocumentoDescripcion?: string | null;
  fechaObtencion: string;
  archivoId?: number | null;
  puntaje: number;
}

export interface ObtenerOfimaticaDataDto {
  estudiosOfimatica: OfimaticaDetalleDto[];
  puntajeTotal?: number;
}

export interface ObtenerOfimaticaResponse extends BaseResponse {
  data: ObtenerOfimaticaDataDto | OfimaticaDetalleDto[] | null;
}

/** POST 201 y PUT 200: acuse de éxito, sin el registro ni la lista. */
export interface GuardarOfimaticaResponse extends BaseResponse {
  data?: unknown;
}

/** DELETE 200: acuse de éxito. La lista vigente se vuelve a consultar con el GET. */
export interface EliminarOfimaticaResponse extends BaseResponse {
  data?: unknown;
}
