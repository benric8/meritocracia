import { BaseResponse } from '../dto/remote/BaseResponse,dto';

export interface DetalleErrorApi {
  mensaje: string;
  codigo?: string;
  codigoOperacion?: string;
}

export class ErrorNegocioApi extends Error {
  readonly detalle: DetalleErrorApi;

  constructor(detalle: DetalleErrorApi) {
    super(detalle.mensaje);
    this.name = 'ErrorNegocioApi';
    this.detalle = detalle;
  }
}

export function esRespuestaApi(body: unknown): body is BaseResponse {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  return 'codigo' in body && 'descripcion' in body;
}
