import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap, throwError } from 'rxjs';
import { getAppConfig } from '../../config/app-runtime-config';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { authEndpoints, urlsGlobal } from '../../api/auth-api.constants';
import { TokenRefreshService } from '../services/token-refresh.service';

/**
 * Interceptor unificado: adjunta Bearer, valida ventana de refresh y renueva el JWT.
 * Reemplaza el antiguo tokenInterceptor + lógica duplicada de web (JwtInterceptor).
 */
export const sessionInterceptor: HttpInterceptorFn = (req, next) => {
  const sesion = inject(SESION_PORT);
  const refreshService = inject(TokenRefreshService);

  const esApiPropia = req.url.startsWith(getAppConfig().urlApi);
  const esRutaPublica = urlsGlobal.some((ruta) => req.url.includes(ruta));
  const esRefresh = req.url.includes(authEndpoints.REFRESH);

  if (!esApiPropia || esRutaPublica) {
    return next(req);
  }

  const token = sesion.getToken();
  if (!token) {
    return next(req);
  }

  if (!esRefresh && refreshService.ventanaRefreshExpirada()) {
    refreshService.cerrarSesionPorExpiracion();
    return throwError(() => new Error('Sesión expirada por inactividad'));
  }

  const conBearer = () =>
    req.clone({
      setHeaders: { Authorization: `Bearer ${sesion.getToken()}` },
    });

  if (!esRefresh && refreshService.debeRefrescar()) {
    return refreshService.refrescarToken().pipe(switchMap(() => next(conBearer())));
  }

  return next(conBearer());
};
