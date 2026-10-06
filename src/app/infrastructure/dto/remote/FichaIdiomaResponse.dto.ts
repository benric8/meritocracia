import { BaseResponse } from './BaseResponse,dto';

export interface GuardarEstudioIdiomaRequestDto {
  fichaValoracionId?: number;
  rubroId: number;
  idiomaId: number;
  nivelIdiomaId: number;
  tipoDocumentoIdiomaId: number;
  institucionId?: number | null;
  fechaObtencion: string;
  archivoId?: number | null;
}

export interface EstudioIdiomaDetalleDto {
  idEstudioIdioma?: number;
  id?: number;
  idFichaValoracion?: number;
  idiomaId: number;
  nivelIdiomaId: number;
  tipoDocumentoIdiomaId: number;
  institucionId?: number | null;
  fechaObtencion: string;
  archivoId?: number | null;
  puntaje: number;
}

export interface ObtenerEstudiosIdiomaResponse extends BaseResponse {
  data: EstudioIdiomaDetalleDto[];
}

export interface GuardarEstudioIdiomaResponse extends BaseResponse {
  data: EstudioIdiomaDetalleDto;
}

export interface EliminarEstudioIdiomaResponse extends BaseResponse {
  data?: EstudioIdiomaDetalleDto[] | null;
}
