import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { urlsGlobal } from '../../api/auth-api.constants';
import { AuditoriaContextService } from '../services/auditoria-context.service';

/**
 * Interceptor global de auditoría (RNF005): adjunta cabeceras X-Request-* a la API propia.
 * La IP pública se resuelve vía `AuditoriaContextService` / `PublicIpService`.
 */
export const auditoriaInterceptor: HttpInterceptorFn = (req, next) => {
  const esApiPropia = req.url.startsWith(environment.urlApi);
  const esRutaPublica = urlsGlobal.some((ruta) => req.url.includes(ruta));

  if (!esApiPropia || esRutaPublica) {
    return next(req);
  }

  const sesion = inject(SESION_PORT);
  const auditoria = inject(AuditoriaContextService);
  const usuario = sesion.getUsuarioCodigo() ?? 'SISTEMA';

  return auditoria.obtenerCabecerasHttp(usuario).pipe(
    switchMap((cabeceras) => {
      const peticion = req.clone({
        setHeaders: {
          'X-Request-Usuario-Aplicativo': cabeceras.get('X-Request-Usuario-Aplicativo') ?? usuario,
          'X-Request-Usuario-Red': cabeceras.get('X-Request-Usuario-Red') ?? usuario,
          'X-Request-Ip': cabeceras.get('X-Request-Ip') ?? '',
          'X-Request-Pc': cabeceras.get('X-Request-Pc') ?? '',
          'X-Request-Mac': cabeceras.get('X-Request-Mac') ?? '',
        },
      });
      return next(peticion);
    })
  );
};
