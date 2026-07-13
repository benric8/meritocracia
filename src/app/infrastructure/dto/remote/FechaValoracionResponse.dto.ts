import { BaseResponse } from './BaseResponse,dto';

export interface FechaValoracionDto {
  id: number | string;
  fechaValoracion: string;
  anio?: number;
  resolucion: string;
  estado: string | boolean;
  usuarioRegistro?: string;
  usuario?: string;
  fechaRegistro: string;
}

export interface FechaValoracionVigenteResponse extends BaseResponse {
  data: FechaValoracionDto | null;
}

export interface ListarFechasValoracionResponse extends BaseResponse {
  data: FechaValoracionDto[];
}

export interface RegistrarFechaValoracionResponse extends BaseResponse {
  data: FechaValoracionDto;
}

export interface RegistrarFechaValoracionRequestDto {
  fechaValoracion: string;
  resolucion: string;
}
