import { BaseResponse } from './BaseResponse,dto';

export interface GuardarAsistenciaEventoRequestDto {
  fichaValoracionId?: number;
  rubroId: number;
  eventoId: number;
  institucionId: number;
  paisId: number;
  fechaInicio: string;
  fechaFin: string;
  juridico: '1' | '0';
  especialidadId: number;
  tema: string;
  modalidadId: number;
  tipoDocumentoId: number;
  archivoId: number | null;
}

export interface AsistenciaEventoDetalleDto {
  idAsistenciaEvento: number;
  idFichaValoracion?: number;
  eventoId: number;
  eventoDescripcion?: string | null;
  institucionId: number;
  institucionNombre?: string | null;
  paisId: number;
  nombrePais?: string | null;
  fechaInicio: string;
  fechaFin: string;
  juridico: string;
  especialidadId: number;
  especialidadDescripcion?: string | null;
  tema: string;
  modalidadId: number;
  modalidadDescripcion?: string | null;
  tipoDocumentoId: number;
  tipoDocumentoDescripcion?: string | null;
  archivoId?: number | null;
  puntaje: number;
}

export interface ObtenerAsistenciasEventosResponse extends BaseResponse {
  data: AsistenciaEventoDetalleDto[] | null;
}

export interface GuardarAsistenciaEventoResponse extends BaseResponse {
  data: AsistenciaEventoDetalleDto | null;
}

export interface EliminarAsistenciaEventoResponse extends BaseResponse {
  data?: null;
}
