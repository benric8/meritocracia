import { BaseResponse } from './BaseResponse,dto';

export interface GuardarDemeritoRequestDto {
  fichaValoracionId?: number;
  rubroId: number;
  tipoMedida: string;
  cantidad: number;
  descripcionDocumento: string;
  observacion: string;
  archivoId?: number | null;
}

export interface DemeritoDetalleDto {
  idDemerito?: number;
  id?: number;
  idFichaValoracion?: number;
  tipoMedida: string;
  cantidad: number;
  descripcionDocumento: string;
  anioValoracion: number;
  observacion?: string | null;
  archivoId?: number | null;
  puntaje: number;
}

export interface ObtenerDemeritosResponse extends BaseResponse {
  data: DemeritoDetalleDto[];
}

export interface GuardarDemeritoResponse extends BaseResponse {
  data: DemeritoDetalleDto;
}

export interface EliminarDemeritoResponse extends BaseResponse {
  data?: DemeritoDetalleDto[] | null;
}
