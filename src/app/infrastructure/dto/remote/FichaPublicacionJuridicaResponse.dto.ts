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

export interface PublicacionJuridicaDetalleDto {
  idPublicacion?: number;
  id?: number;
  idFichaValoracion?: number;
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
  puntaje: number;
}

export interface ObtenerPublicacionesJuridicasResponse extends BaseResponse {
  data: PublicacionJuridicaDetalleDto[];
}

export interface GuardarPublicacionJuridicaResponse extends BaseResponse {
  data: PublicacionJuridicaDetalleDto;
}

export interface EliminarPublicacionJuridicaResponse extends BaseResponse {
  data?: PublicacionJuridicaDetalleDto[] | null;
}
