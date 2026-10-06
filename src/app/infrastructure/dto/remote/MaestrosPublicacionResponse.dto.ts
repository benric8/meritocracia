import { BaseResponse } from './BaseResponse,dto';

export interface TipoPublicacionItemDto {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface ListarTiposPublicacionResponse extends BaseResponse {
  data: TipoPublicacionItemDto[];
}
