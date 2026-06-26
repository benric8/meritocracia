import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';

/**
 * Protege la zona privada: si no hay sesión activa, redirige al login.
 */
export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.autenticado()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

/**
 * Protege la pantalla de login: si el usuario ya tiene sesión activa,
 * lo redirige al inicio para que no vuelva a autenticarse.
 */
export const invitadoGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.autenticado()) {
    return router.createUrlTree(['/inicio']);
  }

  return true;
};
