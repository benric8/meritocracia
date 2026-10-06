import { BaseResponse } from './BaseResponse,dto';

export interface NivelOfimaticaItemDto {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface ListarNivelesOfimaticaResponse extends BaseResponse {
  data: NivelOfimaticaItemDto[];
}
