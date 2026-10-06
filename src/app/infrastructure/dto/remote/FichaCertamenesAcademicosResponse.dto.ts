import { BaseResponse } from './BaseResponse,dto';

export interface GuardarCertamenAcademicoRequestDto {
  fichaValoracionId?: number;
  rubroId: number;
  eventoId: number;
  tipoParticipacionId: number;
  institucionId: number;
  paisId: number;
  fechaInicio: string;
  fechaFin: string;
  juridico: '1' | '0';
  especialidadId: number;
  tema: string;
  modalidadId: number;
  archivoId: number | null;
}

export interface CertamenAcademicoDetalleDto {
  idCertamenAcademico: number;
  idFichaValoracion?: number;
  eventoId: number;
  eventoDescripcion?: string | null;
  tipoParticipacionId: number;
  tipoParticipacionDescripcion?: string | null;
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
  archivoId?: number | null;
  puntaje: number;
}

export interface ObtenerCertamenesAcademicosResponse extends BaseResponse {
  data: CertamenAcademicoDetalleDto[];
}

export interface GuardarCertamenAcademicoResponse extends BaseResponse {
  data: CertamenAcademicoDetalleDto;
}

export interface EliminarCertamenAcademicoResponse extends BaseResponse {
  data?: null;
}
