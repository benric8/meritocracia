import { BaseResponse } from './BaseResponse,dto';

export interface ItemIndicadorDto {
  clave?: string;
  etiqueta?: string;
  cantidad?: number;
  porcentaje?: number;
}

export interface SerieIndicadorDto {
  serie?: string;
  total?: number;
  items?: ItemIndicadorDto[];
}

export interface IndicadorDashboardDto {
  indicador?: string;
  descripcion?: string;
  total?: number;
  series?: SerieIndicadorDto[];
}

/** Respuesta de `GET dashboard/rubros/{indicador}`. */
export interface IndicadorDashboardResponse extends BaseResponse {
  data?: IndicadorDashboardDto;
}
