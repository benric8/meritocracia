import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { ALERTAS_PORT } from '../../../domain/ports/alertas.port';
import { getAppConfig } from '../../config/app-runtime-config';
import { authEndpoints, urlsGlobal } from '../../api/auth-api.constants';
import { esRespuestaApi } from '../../api/api-error.model';
import { esCodigoExito } from '../../api/api-response.util';
import { detalleDesdeRespuestaApi, extraerDetalleErrorApi } from '../../api/http-error.util';
import { usuariosEndpoints } from '../../api/usuarios-api.constants';
import { documentosInstitucionalesEndpoints } from '../../api/inicio-api.constants';
import { fechaValoracionEndpoints } from '../../api/fecha-valoracion-api.constants';

/** Auth: la pantalla/flujo propio muestra el error. */
const RUTAS_AUTH_SIN_MODAL = [
  authEndpoints.TOKEN_BASICO,
  authEndpoints.LOGIN,
  authEndpoints.OPCIONES,
  authEndpoints.REFRESH,
];

/**
 * Mutaciones cuyo fallo ya se notifica en pantalla vía Result (+ ALERTAS_PORT o form).
 * El interceptor no debe abrir un segundo modal.
 */
const MUTACIONES_CON_RESULT: ReadonlyArray<{
  method: string;
  coincide: (url: string) => boolean;
}> = [
  {
    method: 'POST',
    // Registrar: POST .../usuarios (no .../usuarios/...). Listar es GET a la misma base.
    coincide: (url) => esRutaExacta(url, usuariosEndpoints.LISTAR),
  },
  {
    method: 'PUT',
    coincide: (url) => url.includes('usuarios/resetear-clave/'),
  },
  {
    method: 'PUT',
    coincide: (url) => url.includes('usuarios/desactivar/'),
  },
  {
    method: 'PUT',
    coincide: (url) => url.includes(usuariosEndpoints.CAMBIAR_CONTRASENA),
  },
  {
    method: 'POST',
    // Subir documento: POST .../documentos. Listar es GET.
    coincide: (url) => esRutaExacta(url, documentosInstitucionalesEndpoints.LISTAR),
  },
  {
    method: 'PUT',
    coincide: (url) => esRutaReemplazoDocumento(url),
  },
  {
    method: 'POST',
    coincide: (url) => esRutaExacta(url, fechaValoracionEndpoints.REGISTRAR),
  },
  {
    method: 'PATCH',
    coincide: (url) => /fechas-valoracion\/[^/]+\/inactivar\/?$/.test(url),
  },
];

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  if (!debeMostrarModal(req)) {
    return next(req);
  }

  const alertas = inject(ALERTAS_PORT);

  return next(req).pipe(
    tap((event) => {
      if (!(event instanceof HttpResponse) || event.body instanceof Blob) {
        return;
      }

      if (esRespuestaApi(event.body) && !esCodigoExito(event.body.codigo)) {
        void alertas.error('Atención', detalleDesdeRespuestaApi(event.body));
      }
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        void alertas.error(
          'Atención',
          extraerDetalleErrorApi(error, 'No se pudo completar la operación con el servidor.')
        );
      }

      return throwError(() => error);
    })
  );
};

function debeMostrarModal(req: HttpRequest<unknown>): boolean {
  if (!req.url.startsWith(getAppConfig().urlApi)) {
    return false;
  }

  if (urlsGlobal.some((ruta) => req.url.includes(ruta))) {
    return false;
  }

  if (RUTAS_AUTH_SIN_MODAL.some((ruta) => req.url.includes(ruta))) {
    return false;
  }

  if (esMutacionConResultEnPantalla(req)) {
    return false;
  }

  return true;
}

function esMutacionConResultEnPantalla(req: HttpRequest<unknown>): boolean {
  const metodo = req.method.toUpperCase();
  return MUTACIONES_CON_RESULT.some(
    (regla) => regla.method === metodo && regla.coincide(req.url)
  );
}

/** True si el path (sin query) termina exactamente en `/${segmento}`. */
function esRutaExacta(url: string, segmento: string): boolean {
  const path = url.split('?')[0].replace(/\/+$/, '');
  return path.endsWith(`/${segmento}`) || path.endsWith(segmento);
}

function esRutaReemplazoDocumento(url: string): boolean {
  if (url.includes('/descargar/')) {
    return false;
  }

  const path = url.split('?')[0].replace(/\/+$/, '');
  return /\/documentos\/[^/]+$/.test(path);
}
