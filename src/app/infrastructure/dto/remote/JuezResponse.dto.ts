import { BaseResponse } from './BaseResponse,dto';

export interface DatosSigaJuezDto {
  nombreCompleto?: string;
  nombresCompletos?: string;
  apellidosNombres?: string;
  /** Base64 puro (sin prefijo data:) o data URL / URL. */
  foto?: string;
  fotoBase64?: string;
  urlFoto?: string;
}

export interface DatosSigaJuezResponse extends BaseResponse {
  data: DatosSigaJuezDto;
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
