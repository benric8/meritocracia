import { of } from 'rxjs';
import { AutenticacionPort } from '../domain/ports/autenticacion.port';
import { LoginResponse } from '../infrastructure/dto/remote/LoginResponse.dto';
import { OpcionesResponse } from '../infrastructure/dto/remote/OpcionesResponse.dto';

/** Mock de `AUTENTICACION_PORT` para tests. */
export function crearAutenticacionPortMock(
  overrides: Partial<AutenticacionPort> = {}
): AutenticacionPort {
  const mock: AutenticacionPort = {
    generarTokenBasico: () =>
      of({
        token: 'token-test',
        exps: 3600,
        refs: 7200,
      }),
    asegurarTokenBasico: () => of(undefined),
    tokenBasicoVigente: () => true,
    login: () => of({} as LoginResponse),
    opciones: () => of({} as OpcionesResponse),
  };

  return { ...mock, ...overrides };
}
