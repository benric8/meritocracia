import { DetalleError } from '../../../domain/models/detalle-error.model';

/** Escapa texto para inserción segura en HTML de alertas. */
export function escaparHtml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * HTML de error: mensaje y, si existe, código de operación debajo.
 */
export function formatearHtmlDetalleError(detalle: DetalleError): string {
  const mensaje = escaparHtml(detalle.mensaje);
  const codigoOperacion = detalle.codigoOperacion?.trim();

  if (!codigoOperacion) {
    return mensaje;
  }

  return `${mensaje}<br><br><small><strong>Código de operación:</strong> ${escaparHtml(codigoOperacion)}</small>`;
}
