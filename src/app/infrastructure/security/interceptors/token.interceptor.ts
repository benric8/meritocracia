import { HttpInterceptorFn } from '@angular/common/http';
import { constantes, urlsGlobal } from '../../../domain/commons/constants';

/**
 * Inyecta el token JWT (Authorization: Bearer ...) en cada petición saliente,
 * excepto en las rutas públicas declaradas en `urlsGlobal` (ej: /autenticacion).
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const esRutaPublica = urlsGlobal.some((ruta) => req.url.includes(ruta));
  const token = localStorage.getItem(constantes.JWT_TOKEN);

  if (token && !esRutaPublica) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
