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

/** Resultado fallido de un caso de uso (`{ exito: false; mensaje?; detalle? }`). */
export interface ResultadoConError {
  mensaje?: string;
  detalle?: DetalleError;
}

/**
 * `DetalleError` listo para `alertas.error(...)` desde un resultado fallido:
 * prioriza `detalle.mensaje`, luego `mensaje` y por último `mensajePorDefecto`.
 */
export function detalleDeResultado(
  resultado: ResultadoConError,
  mensajePorDefecto = 'Error desconocido.'
): DetalleError {
  return {
    mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? mensajePorDefecto,
    codigo: resultado.detalle?.codigo,
    codigoOperacion: resultado.detalle?.codigoOperacion,
  };
}
