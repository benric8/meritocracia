import { HttpErrorResponse } from '@angular/common/http';
import { DetalleErrorApi, esRespuestaApi } from './api-error.model';

export function detalleDesdeRespuestaApi(
  respuesta: Partial<DetalleErrorApi> & { descripcion?: string }
): DetalleErrorApi {
  return {
    mensaje: respuesta.descripcion?.trim() || 'La operación no pudo completarse.',
    codigo: respuesta.codigo,
    codigoOperacion: respuesta.codigoOperacion,
  };
}

export function extraerDetalleErrorApi(error: unknown, mensajePorDefecto: string): DetalleErrorApi {
  if (error instanceof HttpErrorResponse) {
    const cuerpo = error.error;

    if (esRespuestaApi(cuerpo)) {
      return detalleDesdeRespuestaApi(cuerpo);
    }

    if (typeof cuerpo === 'string' && cuerpo.trim()) {
      return { mensaje: cuerpo.trim() };
    }

    if (typeof cuerpo === 'object' && cuerpo !== null) {
      const parcial = cuerpo as { descripcion?: string; message?: string; codigoOperacion?: string; codigo?: string };
      return {
        mensaje: parcial.descripcion ?? parcial.message ?? mensajePorDefecto,
        codigo: parcial.codigo,
        codigoOperacion: parcial.codigoOperacion,
      };
    }

    return { mensaje: mensajePorDefecto };
  }

  if (error && typeof error === 'object' && 'detalle' in error) {
    return (error as { detalle: DetalleErrorApi }).detalle;
  }

  if (error instanceof Error && error.message.trim()) {
    return { mensaje: error.message };
  }

  return { mensaje: mensajePorDefecto };
}

export function mensajeErrorHttp(error: unknown, mensajePorDefecto: string): string {
  return extraerDetalleErrorApi(error, mensajePorDefecto).mensaje;
}
