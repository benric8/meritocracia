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

/** Línea de GET/POST/PUT. El nombre llega en `institucion`. El puntaje es el valor guardado. */
export interface CertamenAcademicoDetalleDto {
  idCertamenAcademico: number;
  idFichaValoracion?: number;
  eventoId: number;
  tipoParticipacionId: number;
  institucionId: number;
  /** Nombre, o el objeto `{ nombre }` del catálogo de instituciones. */
  institucion?:
    | string
    | { id?: number | string; nombre?: string | null; descripcion?: string | null }
    | null;
  institucionNombre?: string | null;
  paisId: number;
  fechaInicio: string;
  fechaFin: string;
  juridico: string;
  especialidadId: number;
  tema: string;
  modalidadId: number;
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
