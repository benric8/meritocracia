import { catchError, Observable, throwError } from 'rxjs';
import { ErrorNegocioApi } from '../../domain/errors/error-negocio-api';
import { extraerDetalleErrorApi } from './http-error.util';

/**
 * Normaliza cualquier fallo HTTP/negocio a `ErrorNegocioApi`
 * para que application no dependa de `HttpErrorResponse`.
 */
export function mapearAErrorNegocioApi<T>(mensajePorDefecto: string) {
  return (source: Observable<T>): Observable<T> =>
    source.pipe(
      catchError((error: unknown) => {
        if (error instanceof ErrorNegocioApi) {
          return throwError(() => error);
        }

        return throwError(
          () => new ErrorNegocioApi(extraerDetalleErrorApi(error, mensajePorDefecto))
        );
      })
    );
}
