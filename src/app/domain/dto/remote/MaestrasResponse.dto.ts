import { BaseResponse } from './BaseResponse,dto';
//------------------------------------------
export interface TipoDocumento {
  id: string;
  nombre: string;
  abreviatura: string;
  activo: string;
}
export interface TipoDocumentoResponse extends BaseResponse {
  data: TipoDocumento[];
}

export interface Sexo {
  id: string;
  nombre: string;
  abreviatura: string;
  activo: string;
}
export interface SexoResponse extends BaseResponse {
  data: Sexo[];
}
