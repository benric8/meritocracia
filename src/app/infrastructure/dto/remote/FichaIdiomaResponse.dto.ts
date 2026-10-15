import { BaseResponse } from './BaseResponse,dto';

export interface GuardarEstudioIdiomaRequestDto {
  fichaValoracionId?: number;
  rubroId: number;
  idiomaId: number;
  nivelIdiomaId: number;
  tipoDocumentoIdiomaId: number;
  institucionId: number;
  fechaObtencion: string;
  archivoId?: number | null;
}

/** Ítem de `GET fichas-estudios-idioma` (`EstudioIdiomaResponse`). */
export interface EstudioIdiomaDetalleDto {
  idEstudioIdioma: number;
  idiomaId: number;
  idiomaNombre?: string | null;
  nivelIdiomaId: number;
  nivelIdiomaNombre?: string | null;
  tipoDocumentoIdiomaId: number;
  tipoDocumentoNombre?: string | null;
  institucionId: number;
  institucionNombre?: string | null;
  fechaObtencion: string;
  archivoId?: number | null;
  puntaje: number;
}

export interface ObtenerEstudiosIdiomaDataDto {
  estudiosIdioma: EstudioIdiomaDetalleDto[];
  puntajeTotal?: number;
}

export interface ObtenerEstudiosIdiomaResponse extends BaseResponse {
  data: ObtenerEstudiosIdiomaDataDto | EstudioIdiomaDetalleDto[];
}

/** POST 201 y PUT 200: acuse de éxito, sin el registro ni la lista. */
export interface GuardarEstudioIdiomaResponse extends BaseResponse {
  data?: unknown;
}

/** DELETE 200: acuse de éxito. La lista vigente se vuelve a consultar con el GET. */
export interface EliminarEstudioIdiomaResponse extends BaseResponse {
  data?: unknown;
}
