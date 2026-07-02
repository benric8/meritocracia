import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { existeOpcionPorRuta } from '../../../domain/commons/permisos-menu';
import { SESION_PORT } from '../../../domain/ports/sesion.port';

function esRutaInicio(ruta: string): boolean {
  return ruta === '/inicio' || ruta === '/';
}

/**
 * Valida que la ruta solicitada exista en las opciones autorizadas del backend.
 * Sin opciones cargadas solo permite Inicio (sesión degradada).
 */
export const permisoRutaGuard: CanActivateFn = (_route, state) => {
  const sesion = inject(SESION_PORT);
  const router = inject(Router);

  const ruta = state.url.split('?')[0];
  if (esRutaInicio(ruta)) {
    return true;
  }

  const opciones = sesion.getOpciones();
  if (!opciones.length) {
    return router.createUrlTree(['/inicio']);
  }

  if (existeOpcionPorRuta(ruta, opciones)) {
    return true;
  }

  return router.createUrlTree(['/inicio']);
};
