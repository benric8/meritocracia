import { BaseResponse } from './BaseResponse,dto';

export interface GuardarPublicacionJuridicaRequestDto {
  fichaValoracionId?: number;
  rubroId: number;
  tipoPublicacionId: number;
  titulo: string;
  editorial: string;
  paginas: number;
  numEdicion: string;
  auspicio?: string | null;
  paisId: number;
  ordenJuridico: string;
  especialidad?: string | null;
  institucionId?: number | null;
  fechaPublicacion: string;
  premiada: string;
  archivoId?: number | null;
}

/** Ítem de `GET fichas-publicaciones-juridicas` (`PublicacionJuridicaResponse`). */
export interface PublicacionJuridicaDetalleDto {
  idPublicacion: number;
  tipoPublicacionId: number;
  tipoPublicacionNombre?: string | null;
  titulo: string;
  editorial: string;
  paginas: number;
  numEdicion: string;
  auspicio?: string | null;
  paisId: number;
  paisNombre?: string | null;
  ordenJuridico: string;
  especialidad?: string | null;
  institucionId?: number | null;
  institucionNombre?: string | null;
  fechaPublicacion: string;
  premiada: string;
  archivoId?: number | null;
  puntaje: number;
}

export interface ObtenerPublicacionesJuridicasDataDto {
  publicacionesJuridicas: PublicacionJuridicaDetalleDto[];
  puntajeTotal?: number;
}

export interface ObtenerPublicacionesJuridicasResponse extends BaseResponse {
  data: ObtenerPublicacionesJuridicasDataDto | PublicacionJuridicaDetalleDto[];
}

/** POST 201 y PUT 200: acuse de éxito, sin el registro ni la lista. */
export interface GuardarPublicacionJuridicaResponse extends BaseResponse {
  data?: unknown;
}

/** DELETE 200: acuse de éxito. La lista vigente se vuelve a consultar con el GET. */
export interface EliminarPublicacionJuridicaResponse extends BaseResponse {
  data?: unknown;
}
