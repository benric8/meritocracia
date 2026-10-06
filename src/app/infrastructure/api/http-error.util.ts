import { HttpErrorResponse } from '@angular/common/http';
import { DetalleError } from '../../domain/models/detalle-error.model';
import { esRespuestaApi } from './api-error.model';

export function detalleDesdeRespuestaApi(
  respuesta: Partial<DetalleError> & { descripcion?: string; data?: unknown }
): DetalleError {
  const mensajes = mensajesTextoDeData(respuesta.data);
  return {
    mensaje: mensajes ?? (respuesta.descripcion?.trim() || 'La operación no pudo completarse.'),
    codigo: respuesta.codigo,
    codigoOperacion: respuesta.codigoOperacion,
  };
}

/** E400 trae la lista de validación en `data`. Un arreglo de objetos no se interpreta. */
function mensajesTextoDeData(data: unknown): string | null {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  if (!data.every((item) => typeof item === 'string')) {
    return null;
  }
  const textos = data.map((item) => item.trim()).filter(Boolean);
  return textos.length ? textos.join('\n') : null;
}

export function extraerDetalleErrorApi(error: unknown, mensajePorDefecto: string): DetalleError {
  if (error instanceof HttpErrorResponse) {
    const cuerpo = error.error;

    if (esRespuestaApi(cuerpo)) {
      return detalleDesdeRespuestaApi(cuerpo);
    }

    if (typeof cuerpo === 'string' && cuerpo.trim()) {
      return { mensaje: cuerpo.trim() };
    }

    if (typeof cuerpo === 'object' && cuerpo !== null) {
      const parcial = cuerpo as {
        descripcion?: string;
        message?: string;
        codigoOperacion?: string;
        codigo?: string;
        data?: unknown;
      };
      const mensajes = mensajesTextoDeData(parcial.data);
      return {
        mensaje: mensajes ?? parcial.descripcion ?? parcial.message ?? mensajePorDefecto,
        codigo: parcial.codigo,
        codigoOperacion: parcial.codigoOperacion,
      };
    }

    return { mensaje: mensajePorDefecto };
  }

  if (error && typeof error === 'object' && 'detalle' in error) {
    return (error as { detalle: DetalleError }).detalle;
  }

  if (error instanceof Error && error.message.trim()) {
    return { mensaje: error.message };
  }

  return { mensaje: mensajePorDefecto };
}
