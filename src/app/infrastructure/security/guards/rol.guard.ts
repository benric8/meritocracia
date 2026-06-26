import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore, PerfilUsuario } from '../stores/auth.store';

/**
 * Guard de roles. Recibe los perfiles autorizados para la ruta.
 * - Sin sesión → redirige al login.
 * - Con sesión pero sin el perfil requerido → redirige al inicio.
 *
 * Uso en rutas: `canActivate: [rolGuard(['Administrador'])]`
 */
export const rolGuard = (rolesPermitidos: PerfilUsuario[]): CanActivateFn => {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (!authStore.autenticado()) {
      return router.createUrlTree(['/login']);
    }

    if (rolesPermitidos.includes(authStore.perfil())) {
      return true;
    }

    return router.createUrlTree(['/inicio']);
  };
};
