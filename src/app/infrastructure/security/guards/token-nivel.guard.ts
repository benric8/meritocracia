import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { AuthStore } from '../stores/auth.store';

/**
 * Exige un nivel de token JWT concreto (NIVEL_AUTH | NIVEL_LOGIN | NIVEL_OPCIONES).
 * La zona privada debe usar NIVEL_OPCIONES (sesión con perfil y menú cargado).
 */
export const tokenNivelGuard = (nivelRequerido: string): CanActivateFn => {
  return () => {
    const sesion = inject(SESION_PORT);
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (sesion.getTokenNivel() === nivelRequerido && authStore.autenticado()) {
      return true;
    }

    authStore.cerrarSesion();
    return router.createUrlTree(['/login']);
  };
};
