import { DetalleError } from '../../domain/models/detalle-error.model';
import { BaseResponse } from '../dto/remote/BaseResponse,dto';

export class ErrorNegocioApi extends Error {
  readonly detalle: DetalleError;

  constructor(detalle: DetalleError) {
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
