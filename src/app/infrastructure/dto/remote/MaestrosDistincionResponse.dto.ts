import { BaseResponse } from './BaseResponse,dto';

export interface TipoDocumentoDistincionItemDto {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface TipoDistincionItemDto {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface ListarTiposDocumentoDistincionResponse extends BaseResponse {
  data: TipoDocumentoDistincionItemDto[];
}

export interface ListarTiposDistincionResponse extends BaseResponse {
  data: TipoDistincionItemDto[];
}
