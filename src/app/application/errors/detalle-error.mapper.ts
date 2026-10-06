import { ErrorNegocioApi } from '../../domain/errors/error-negocio-api';
import { DetalleError } from '../../domain/models/detalle-error.model';

/**
 * Normaliza fallos de puertos a `DetalleError` sin depender de infrastructure.
 * Los adapters deben emitir `ErrorNegocioApi` (vía `mapearAErrorNegocioApi`).
 */
export function aDetalleError(error: unknown, mensajePorDefecto: string): DetalleError {
  if (error instanceof ErrorNegocioApi) {
    return error.detalle;
  }

  if (error && typeof error === 'object' && 'detalle' in error) {
    const detalle = (error as { detalle: DetalleError }).detalle;
    if (detalle?.mensaje?.trim()) {
      return detalle;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return { mensaje: error.message };
  }

  return { mensaje: mensajePorDefecto };
}
