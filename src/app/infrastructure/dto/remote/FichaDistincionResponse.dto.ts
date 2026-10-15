import { BaseResponse } from './BaseResponse,dto';

export interface GuardarDistincionRequestDto {
  fichaValoracionId?: number;
  rubroId: number;
  tipoDistincionId: number;
  tipoDocumentoDistincionId: number;
  descripcion?: string | null;
  fechaDistincion: string;
  institucionOtorgante?: string | null;
  paisId?: number | null;
  archivoId?: number | null;
}

/** Ítem de `GET fichas-distinciones` (`DistincionResponse`). */
export interface DistincionDetalleDto {
  idDistincion: number;
  tipoDistincionId: number;
  tipoDistincionNombre?: string | null;
  tipoDocumentoDistincionId: number;
  tipoDocumentoDistincionNombre?: string | null;
  descripcion?: string | null;
  fechaDistincion: string;
  institucionOtorgante?: string | null;
  paisId?: number | null;
  paisNombre?: string | null;
  archivoId?: number | null;
  puntaje: number;
}

export interface ObtenerDistincionesDataDto {
  distinciones: DistincionDetalleDto[];
  puntajeTotal?: number;
}

export interface ObtenerDistincionesResponse extends BaseResponse {
  data: ObtenerDistincionesDataDto | DistincionDetalleDto[];
}

/** POST 201 y PUT 200: acuse de éxito, sin el registro ni la lista. */
export interface GuardarDistincionResponse extends BaseResponse {
  data?: unknown;
}

/** DELETE 200: acuse de éxito. La lista vigente se vuelve a consultar con el GET. */
export interface EliminarDistincionResponse extends BaseResponse {
  data?: unknown;
}
