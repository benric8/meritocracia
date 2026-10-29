import { toCuadroAntiguedad } from './cuadro-antiguedad.mapper';

describe('cuadro-antiguedad.mapper', () => {
  it('mapea el cuadro y normaliza ids a texto', () => {
    const cuadro = toCuadroAntiguedad({
      idFechaValoracion: 3,
      fechaValoracion: '2026-12-31',
      nota: '(*) Nota ',
      filas: [
        {
          orden: 1,
          idMagistrado: 12,
          idFichaValoracion: 40,
          apellidosNombres: 'PEREZ GOMEZ JUAN',
          fechaNacimiento: '1960-05-14',
          tiempoTitular: { anios: 11, meses: 9, dias: 29 },
          periodosProvisional: 3,
          finProvisional: null,
        },
      ],
    });

    expect(cuadro.idFechaValoracion).toBe('3');
    expect(cuadro.nota).toBe('(*) Nota');
    expect(cuadro.filas[0]).toMatchObject({
      orden: 1,
      idMagistrado: '12',
      idFichaValoracion: '40',
      fechaNacimiento: '1960-05-14',
      tiempoTitular: { anios: 11, meses: 9, dias: 29 },
      tiempoJuezSuperior: null,
      finProvisional: null,
      aniosColegiatura: null,
    });
  });

  it('devuelve un cuadro vacío sin data', () => {
    expect(toCuadroAntiguedad(null)).toEqual({
      idFechaValoracion: '',
      fechaValoracion: '',
      nota: '',
      filas: [],
    });
  });
});
