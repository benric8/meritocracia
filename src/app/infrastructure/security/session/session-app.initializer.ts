import { inject } from '@angular/core';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { AuthStore } from '../stores/auth.store';
import { SessionVigenciaService } from './session-vigencia.service';

/**
 * Al arrancar la app:
 * - Limpia restos de sesión expirada en localStorage.
 * - Inicia el monitoreo si la sesión rehidratada sigue vigente.
 */
export function prepararVigenciaSesion(): void {
  const sesion = inject(SESION_PORT);
  const authStore = inject(AuthStore);
  const vigencia = inject(SessionVigenciaService);

  if (!authStore.autenticado() && sesion.getToken()) {
    sesion.limpiarSesion();
  }

  if (authStore.autenticado()) {
    vigencia.iniciarMonitoreo();
  }
}
