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

export interface ObtenerPasantiasResponse extends BaseResponse {
  data: PasantiaDetalleDto[];
}

export interface GuardarPasantiaResponse extends BaseResponse {
  data: PasantiaDetalleDto;
}

export interface EliminarPasantiaResponse extends BaseResponse {
  data?: null;
}
