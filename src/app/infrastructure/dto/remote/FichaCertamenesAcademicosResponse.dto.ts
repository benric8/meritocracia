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

/** Ítem de `GET fichas-certamenes-academicos` (`CertamenAcademicoResponse`). */
export interface CertamenAcademicoDetalleDto {
  idCertamenAcademico: number;
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

export interface ObtenerCertamenesAcademicosDataDto {
  certamenesAcademicos: CertamenAcademicoDetalleDto[];
  puntajeTotal?: number;
}

export interface ObtenerCertamenesAcademicosResponse extends BaseResponse {
  data: ObtenerCertamenesAcademicosDataDto | CertamenAcademicoDetalleDto[];
}

/** POST 201 y PUT 200: acuse de éxito, sin el registro ni la lista. */
export interface GuardarCertamenAcademicoResponse extends BaseResponse {
  data?: unknown;
}

/** DELETE 200: acuse de éxito. La lista vigente se vuelve a consultar con el GET. */
export interface EliminarCertamenAcademicoResponse extends BaseResponse {
  data?: unknown;
}
