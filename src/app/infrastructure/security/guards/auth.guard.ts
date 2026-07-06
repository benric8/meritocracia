import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { SessionVigenciaService } from '../session/session-vigencia.service';

/** Protege la zona privada: exige sesión vigente dentro de la ventana exps + refs. */
export const authGuard: CanActivateFn = () => {
  return inject(SessionVigenciaService).resolverAccesoZonaPrivada();
};

/**
 * Pantalla de login: redirige al inicio solo si la sesión persistida sigue vigente.
 * Si expiró, limpia el almacenamiento y permite ingresar credenciales.
 */
export const invitadoGuard: CanActivateFn = () => {
  return inject(SessionVigenciaService).resolverAccesoLogin();
};
