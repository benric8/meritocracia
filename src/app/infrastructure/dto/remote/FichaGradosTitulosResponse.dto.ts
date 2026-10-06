import { BaseResponse } from './BaseResponse,dto';

export interface GuardarGradoTituloRequestDto {
  fichaValoracionId?: number;
  rubroId: number;
  gradoAcademicoId: number;
  universidadId: number;
  paisId: number;
  fechaObtencion: string;
  especialidad: string;
  mencion: string;
  observacion?: string | null;
}

export interface GradoTituloDetalleDto {
  idGradoTitulo?: number;
  idFichaGradoTitulo?: number;
  idFichaValoracion?: number;
  gradoAcademicoId: number;
  gradoAcademicoNombre?: string | null;
  universidadId: number;
  universidadNombre?: string | null;
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

export interface GuardarGradoTituloResponse extends BaseResponse {
  data: GradoTituloDetalleDto;
}

export interface EliminarGradoTituloResponse extends BaseResponse {
  data?: ObtenerGradosTitulosDataDto | null;
}
