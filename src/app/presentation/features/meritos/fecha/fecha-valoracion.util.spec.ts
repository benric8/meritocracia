import { describe, expect, it } from 'vitest';
import {
  fechaHoyIso,
  formatearFechaCorta,
  mensajeErrorCampoFechaValoracion,
} from './fecha-valoracion.util';

describe('fecha-valoracion.util', () => {
  it('formatea fecha ISO corta sin desfase de zona', () => {
    expect(formatearFechaCorta('2026-07-02')).toBe('02/07/2026');
    expect(formatearFechaCorta('2026-07-02T15:30:00.000Z')).toBe('02/07/2026');
  });

  it('fechaHoyIso retorna YYYY-MM-DD', () => {
    expect(fechaHoyIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('mensajeErrorCampoFechaValoracion exige touched', () => {
    expect(
      mensajeErrorCampoFechaValoracion({ errors: { required: true }, touched: false }, 'resolucion')
    ).toBeNull();
    expect(
      mensajeErrorCampoFechaValoracion({ errors: { required: true }, touched: true }, 'resolucion')
    ).toContain('resolución');
  });
});
