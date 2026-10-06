import { BaseResponse } from './BaseResponse,dto';

import { PaginatedResponseDto } from './PaginatedResponse.dto';

export interface DocumentoInstitucionalDto {
  id?: string | number;
  uuid?: string | number;
  tipoDocumento?: string;
  nombreDocumento?: string;
  fechaRegistro?: string;
  usuarioRegistra?: string;
}

export interface DocumentoInstitucionalResponse extends BaseResponse {
  data: DocumentoInstitucionalDto;
}

export type ListarDocumentosInstitucionalesResponse = PaginatedResponseDto<DocumentoInstitucionalDto>;
