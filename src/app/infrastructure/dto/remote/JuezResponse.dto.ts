import { BaseResponse } from './BaseResponse,dto';

export interface DatosSigaJuezDto {
  nombreCompleto?: string;
  nombresCompletos?: string;
  apellidosNombres?: string;
  foto?: string;
  fotoBase64?: string;
  urlFoto?: string;
}

export interface DatosSigaJuezResponse extends BaseResponse {
  data: DatosSigaJuezDto;
}

export interface DatosSigaJuezRequestDto {
  dni: string;
}

export interface EdadJuezDto {
  edad?: number;
  anios?: number;
}

export interface EdadJuezResponse extends BaseResponse {
  data: EdadJuezDto | number;
}

export interface CalcularEdadJuezRequestDto {
  fechaNacimiento: string;
  fechaValoracion: string;
}
