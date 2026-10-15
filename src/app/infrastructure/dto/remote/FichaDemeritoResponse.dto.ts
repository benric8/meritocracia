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

/** Ítem de `GET fichas-demeritos` (`DemeritoResponse`). */
export interface DemeritoDetalleDto {
  idDemerito: number;
  tipoMedida: string;
  cantidad: number;
  descripcionDocumento: string;
  anioValoracion: number;
  observacion?: string | null;
  archivoId?: number | null;
  puntaje: number;
}

export interface ObtenerDemeritosDataDto {
  demeritos: DemeritoDetalleDto[];
  puntajeTotal?: number;
}

export interface ObtenerDemeritosResponse extends BaseResponse {
  data: ObtenerDemeritosDataDto | DemeritoDetalleDto[];
}

/** POST 201 y PUT 200: acuse de éxito, sin el registro ni la lista. */
export interface GuardarDemeritoResponse extends BaseResponse {
  data?: unknown;
}

/** DELETE 200: acuse de éxito. La lista vigente se vuelve a consultar con el GET. */
export interface EliminarDemeritoResponse extends BaseResponse {
  data?: unknown;
}
