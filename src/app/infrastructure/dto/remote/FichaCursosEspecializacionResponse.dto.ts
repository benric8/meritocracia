import { BaseResponse } from './BaseResponse,dto';

export interface GuardarCursoEspecializacionRequestDto {
  fichaValoracionId?: number;
  rubroId: number;
  tipoCursoEspecializacionId: number;
  nombreCurso: string;
  institucionId: number;
  paisId: number;
  fechaInicio: string;
  fechaFin: string;
  juridico: '1' | '0';
  especialidadId: number;
  tiempoHoras: number;
  archivoId: number | null;
}

export interface CursoEspecializacionDetalleDto {
  idCursoEspecializacion: number;
  idFichaValoracion?: number;
  tipoCursoEspecializacionId: number;
  tipoCursoEspecializacionDescripcion?: string | null;
  nombreCurso: string;
  institucionId: number;
  institucionNombre?: string | null;
  paisId: number;
  nombrePais?: string | null;
  fechaInicio: string;
  fechaFin: string;
  juridico: string;
  especialidadId: number;
  especialidadDescripcion?: string | null;
  tiempoHoras: number;
  archivoId?: number | null;
  puntaje: number;
}

export interface ObtenerCursosEspecializacionDataDto {
  cursosEspecializacion: CursoEspecializacionDetalleDto[];
  puntajeTotal?: number;
}

export interface ObtenerCursosEspecializacionResponse extends BaseResponse {
  data: ObtenerCursosEspecializacionDataDto | CursoEspecializacionDetalleDto[];
}

/** POST 201 y PUT 200: acuse de éxito, sin el registro ni la lista. */
export interface GuardarCursoEspecializacionResponse extends BaseResponse {
  data?: unknown;
}

/** DELETE 200: acuse de éxito. La lista vigente se vuelve a consultar con el GET. */
export interface EliminarCursoEspecializacionResponse extends BaseResponse {
  data?: unknown;
}
