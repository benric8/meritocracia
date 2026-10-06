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

export interface ObtenerOfimaticaResponse extends BaseResponse {
  data: OfimaticaDetalleDto[] | null;
}

export interface GuardarOfimaticaResponse extends BaseResponse {
  data: OfimaticaDetalleDto | null;
}

export interface EliminarOfimaticaResponse extends BaseResponse {
  data?: null;
}
