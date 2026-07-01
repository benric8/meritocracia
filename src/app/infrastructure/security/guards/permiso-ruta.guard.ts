import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { existeOpcionPorRuta } from '../../../domain/commons/permisos-menu';
import { SESION_PORT } from '../../../domain/ports/sesion.port';

/**
 * Valida que la ruta solicitada exista en las opciones autorizadas del backend.
 * Si no hay opciones cargadas (modo respaldo), deja pasar para no bloquear desarrollo.
 */
export const permisoRutaGuard: CanActivateFn = (_route, state) => {
  const sesion = inject(SESION_PORT);
  const router = inject(Router);

  const opciones = sesion.getOpciones();
  if (!opciones.length) {
    return true;
  }

  const ruta = state.url.split('?')[0];
  if (ruta === '/inicio') {
    return true;
  }

  if (existeOpcionPorRuta(ruta, opciones)) {
    return true;
  }

  return router.createUrlTree(['/inicio']);
};
