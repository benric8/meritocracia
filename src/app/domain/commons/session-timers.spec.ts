import {
  enVentanaRenovacion,
  formatearDuracion,
  segundosRestantesRefresh,
  tokenVigente,
  ventanaRefreshVigente,
} from './session-timers';

describe('session-timers', () => {
  const EXPS = 3600;
  const REFS = 3600;

  it('considera vigente el token dentro del margen', () => {
    expect(tokenVigente(100, EXPS)).toBe(true);
    expect(tokenVigente(3596, EXPS)).toBe(false);
  });

  it('valida la ventana total de refresh', () => {
    expect(ventanaRefreshVigente(5000, EXPS, REFS)).toBe(true);
    expect(ventanaRefreshVigente(7201, EXPS, REFS)).toBe(false);
  });

  it('detecta la ventana de renovación', () => {
    expect(enVentanaRenovacion(3700, EXPS, REFS)).toBe(true);
    expect(enVentanaRenovacion(100, EXPS, REFS)).toBe(false);
  });

  it('calcula segundos restantes y formato legible', () => {
    expect(segundosRestantesRefresh(7000, EXPS, REFS)).toBe(200);
    expect(formatearDuracion(125)).toBe('2 min 5 s');
  });
});
