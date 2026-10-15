import { BaseResponse } from './BaseResponse,dto';

export interface GuardarGradoTituloRequestDto {
  fichaValoracionId?: number;
  rubroId: number;
  gradoAcademicoId: number;
  institucionId: number;
  paisId: number;
  fechaObtencion: string;
  especialidad: string;
  mencion: string;
  observacion?: string | null;
  archivoId?: number | null;
}

/** Ítem de `GET fichas-grados-titulos` (`GradoTituloResponse`). */
export interface GradoTituloDetalleDto {
  idGradoTitulo?: number;
  idFichaGradoTitulo?: number;
  idFichaValoracion?: number;
  gradoAcademicoId: number;
  gradoAcademicoNombre?: string | null;
  institucionId: number;
  institucionNombre?: string | null;
  paisId: number;
  paisNombre?: string | null;
  fechaObtencion: string;
  especialidad: string;
  mencion: string;
  observacion?: string | null;
  puntaje: number;
}

export interface ObtenerGradosTitulosDataDto {
  gradosTitulos: GradoTituloDetalleDto[];
  puntajeTotal?: number;
}

export interface ObtenerGradosTitulosResponse extends BaseResponse {
  data: ObtenerGradosTitulosDataDto | GradoTituloDetalleDto[];
}

/** POST 201 y PUT 200: acuse de éxito, sin el registro ni la lista. */
export interface GuardarGradoTituloResponse extends BaseResponse {
  data?: unknown;
}

/** DELETE 200: acuse de éxito. La lista vigente se vuelve a consultar con el GET. */
export interface EliminarGradoTituloResponse extends BaseResponse {
  data?: unknown;
}
