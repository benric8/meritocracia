import { DetalleError } from '../models/detalle-error.model';

/** Error de negocio normalizado (puertos/adapters → application). */
export class ErrorNegocioApi extends Error {
  readonly detalle: DetalleError;

  constructor(detalle: DetalleError) {
    super(detalle.mensaje);
    this.name = 'ErrorNegocioApi';
    this.detalle = detalle;
  }
}
