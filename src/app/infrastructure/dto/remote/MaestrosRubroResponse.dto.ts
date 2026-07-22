import { BaseResponse } from './BaseResponse,dto';

export interface RubroMaestroDto {
  idRubro: number;
  codigo: string;
  nombre: string;
  orden: number;
  puntajeMaximo: number | null;
  tieneDetalle: boolean;
  tieneSubrubros: boolean;
}

export interface ListarRubrosMaestroResponse extends BaseResponse {
  data: RubroMaestroDto[];
}

export interface SubrubroMaestroDto {
  idSubrubro: number;
  idRubro: number;
  codigo: string;
  nombre: string;
  orden: number;
  puntajeMaximo: number | null;
  aniosVigencia: number | null;
}

export interface ListarSubrubrosMaestroResponse extends BaseResponse {
  data: SubrubroMaestroDto[];
}
