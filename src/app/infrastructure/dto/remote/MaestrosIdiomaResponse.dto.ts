import { BaseResponse } from './BaseResponse,dto';

export interface IdiomaItemDto {
  id: number;
  nombre: string;
  tipo: 'NATIVO' | 'EXTRANJERO';
}

export interface NivelIdiomaItemDto {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface TipoDocumentoIdiomaItemDto {
  id: number;
  descripcion: string;
}

export interface ListarIdiomasResponse extends BaseResponse {
  data: IdiomaItemDto[];
}

export interface ListarNivelesIdiomaResponse extends BaseResponse {
  data: NivelIdiomaItemDto[];
}

export interface ListarTiposDocumentoIdiomaResponse extends BaseResponse {
  data: TipoDocumentoIdiomaItemDto[];
}
