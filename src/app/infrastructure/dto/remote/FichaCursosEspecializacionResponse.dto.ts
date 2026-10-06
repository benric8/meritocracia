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
  trasladoEvento: string;
}

export interface ObtenerCursosEspecializacionResponse extends BaseResponse {
  data: CursoEspecializacionDetalleDto[];
}

export interface GuardarCursoEspecializacionResponse extends BaseResponse {
  data: CursoEspecializacionDetalleDto;
}

export interface EliminarCursoEspecializacionResponse extends BaseResponse {
  data?: null;
}
