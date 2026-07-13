import { DetalleError } from '../../domain/models/detalle-error.model';
import { extraerDetalleErrorApi } from '../../infrastructure/api/http-error.util';

/**
 * Adaptador de application → infrastructure para normalizar fallos de API/puertos.
 * Los use cases deben devolver `DetalleError`, nunca strings formateados para UI.
 */
export function aDetalleError(error: unknown, mensajePorDefecto: string): DetalleError {
  return extraerDetalleErrorApi(error, mensajePorDefecto);
}
