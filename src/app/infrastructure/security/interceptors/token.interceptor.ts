import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { constantes, urlsGlobal } from '../../../domain/commons/constants';

/**
 * Inyecta el token JWT (Authorization: Bearer ...) ÚNICAMENTE en las peticiones
 * dirigidas a nuestro propio backend (environment.urlApi).
 *
 * Importante:
 * - Nunca adjunta el token a URLs de terceros (evita fuga del token y el
 *   preflight CORS que provocaban, p. ej., las llamadas a servicios externos).
 * - Excluye las rutas públicas declaradas en `urlsGlobal` (ej: api/authenticate),
 *   que se autentican con credenciales de consumo en headers, no con Bearer.
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const esApiPropia = req.url.startsWith(environment.urlApi);
  const esRutaPublica = urlsGlobal.some((ruta) => req.url.includes(ruta));
  const token = localStorage.getItem(constantes.JWT_TOKEN);

  if (token && esApiPropia && !esRutaPublica) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
