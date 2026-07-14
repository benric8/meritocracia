import { BaseResponse } from './BaseResponse,dto';

export interface NivelTitularDto {
  id: number | string;
  nombre?: string;
  descripcion?: string;
  abreviatura?: string;
  activo?: string | boolean;
}

export interface ListarNivelesTitularResponse extends BaseResponse {
  data: NivelTitularDto[];
}
