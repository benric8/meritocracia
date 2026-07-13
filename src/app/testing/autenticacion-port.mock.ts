import { of } from 'rxjs';
import { AutenticacionPort } from '../domain/ports/autenticacion.port';

/** Mock de `AUTENTICACION_PORT` para tests. */
export function crearAutenticacionPortMock(
  overrides: Partial<AutenticacionPort> = {}
): AutenticacionPort {
  return {
    generarTokenBasico: () =>
      of({
        token: 'token-test',
        exps: 3600,
        refs: 7200,
      }),
    asegurarTokenBasico: () => of(undefined),
    tokenBasicoVigente: () => true,
    login: () => of({} as never),
    opciones: () => of({} as never),
    ...overrides,
  };
}
