import { AlertasPort } from '../domain/ports/alertas.port';

/** Mock de `ALERTAS_PORT` para tests (sin SweetAlert). */
export function crearAlertasPortMock(
  overrides: Partial<AlertasPort> = {}
): AlertasPort {
  return {
    error: () => Promise.resolve(),
    exito: () => Promise.resolve(),
    confirmar: () => Promise.resolve(true),
    ...overrides,
  };
}
