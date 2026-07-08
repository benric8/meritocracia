import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { authEndpoints, urlsGlobal } from '../../api/auth-api.constants';
import { ApiErrorModalService } from '../../api/api-error-modal.service';
import { esRespuestaApi } from '../../api/api-error.model';
import { esCodigoExito } from '../../api/api-response.util';
import { OMITIR_MODAL_ERROR_API } from '../../api/http-context.tokens';
import { detalleDesdeRespuestaApi, extraerDetalleErrorApi } from '../../api/http-error.util';

const RUTAS_SIN_MODAL = [
  authEndpoints.TOKEN_BASICO,
  authEndpoints.LOGIN,
  authEndpoints.OPCIONES,
  authEndpoints.REFRESH,
];

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  if (!debeMostrarModal(req.url, req.context.get(OMITIR_MODAL_ERROR_API))) {
    return next(req);
  }

  const modal = inject(ApiErrorModalService);

  return next(req).pipe(
    tap((event) => {
      if (!(event instanceof HttpResponse) || event.body instanceof Blob) {
        return;
      }

      if (esRespuestaApi(event.body) && !esCodigoExito(event.body.codigo)) {
        void modal.mostrar(detalleDesdeRespuestaApi(event.body));
      }
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        void modal.mostrar(
          extraerDetalleErrorApi(error, 'No se pudo completar la operación con el servidor.')
        );
      }

      return throwError(() => error);
    })
  );
};

function debeMostrarModal(url: string, omitirModal: boolean): boolean {
  if (omitirModal || !url.startsWith(environment.urlApi)) {
    return false;
  }

  if (urlsGlobal.some((ruta) => url.includes(ruta))) {
    return false;
  }

  return !RUTAS_SIN_MODAL.some((ruta) => url.includes(ruta));
}
