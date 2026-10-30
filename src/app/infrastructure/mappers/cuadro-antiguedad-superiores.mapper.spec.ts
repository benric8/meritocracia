import { toCuadroAntiguedadSuperiores } from './cuadro-antiguedad-superiores.mapper';

describe('toCuadroAntiguedadSuperiores', () => {
  it('convierte ids a texto, normaliza notas y completa ordenNacional', () => {
    const cuadro = toCuadroAntiguedadSuperiores({
      idFechaValoracion: 3,
      fechaValoracion: '2026-12-31',
      idDistritoJudicial: null,
      distritoJudicial: null,
      notaCesantes: '  ',
      notaDistrito: ' (**) Corte ',
      notaProvisional: '(***) Provisional',
      filas: [{ orden: 1, idMagistrado: 12, apellidosNombres: 'PEREZ', cesante: null }],
    });

    expect(cuadro.idFechaValoracion).toBe('3');
    expect(cuadro.idDistritoJudicial).toBe('');
    expect(cuadro.notaCesantes).toBeNull();
    expect(cuadro.notaDistrito).toBe('(**) Corte');
    expect(cuadro.filas[0]).toMatchObject({
      orden: 1,
      ordenNacional: 1,
      idMagistrado: '12',
      cesante: false,
      tiempoReincorporacion: null,
    });
  });

  it('sin data devuelve un cuadro vacío', () => {
    expect(toCuadroAntiguedadSuperiores(null).filas).toEqual([]);
  });
});
