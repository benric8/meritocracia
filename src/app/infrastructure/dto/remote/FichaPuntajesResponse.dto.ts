import { BaseResponse } from './BaseResponse,dto';

export interface RubroPuntajeFichaDto {
  idRubro: number;
  codigo: string;
  nombre: string;
  puntaje: number;
}

export interface PuntajesFichaDataDto {
  idFicha: number;
  puntajeTotal: number;
  rubros: RubroPuntajeFichaDto[];
}

export interface ObtenerPuntajesFichaResponse extends BaseResponse {
  data?: PuntajesFichaDataDto;
}
