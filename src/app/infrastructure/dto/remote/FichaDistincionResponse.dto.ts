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

export interface DistincionDetalleDto {
  idDistincion?: number;
  id?: number;
  idFichaValoracion?: number;
  tipoDistincionId: number;
  tipoDocumentoDistincionId: number;
  descripcion?: string | null;
  fechaDistincion: string;
  institucionOtorgante?: string | null;
  paisId?: number | null;
  archivoId?: number | null;
  puntaje: number;
}

export interface ObtenerDistincionesResponse extends BaseResponse {
  data: DistincionDetalleDto[];
}

export interface GuardarDistincionResponse extends BaseResponse {
  data: DistincionDetalleDto;
}

export interface EliminarDistincionResponse extends BaseResponse {
  data?: DistincionDetalleDto[] | null;
}
