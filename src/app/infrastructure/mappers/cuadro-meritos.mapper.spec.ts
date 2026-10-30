import { toCuadroMeritos } from './cuadro-meritos.mapper';

describe('cuadro-meritos.mapper', () => {
  it('mapea el cuadro con puntajes y nulos permitidos', () => {
    const cuadro = toCuadroMeritos({
      idFechaValoracion: 3,
      fechaValoracion: '2026-12-31',
      puntajeMaximo: 60,
      notaProduccion: 'Producción suspendida.',
      notaCesantes: null,
      filas: [
        {
          orden: 17,
          idMagistrado: 12,
          idFichaValoracion: 40,
          apellidosNombres: 'PEREZ GOMEZ JUAN',
          cesante: true,
          distritoJudicial: 'LIMA',
          segundaEspecialidad: null,
          puntajeAntiguedad: 12,
          puntajeDemeritos: -0.5,
          puntajeTotal: 28.875,
          criterioIII: null,
        },
      ],
    });

    expect(cuadro).toMatchObject({
      idFechaValoracion: '3',
      puntajeMaximo: 60,
      notaCesantes: null,
    });
    expect(cuadro.filas[0]).toMatchObject({
      orden: 17,
      idFichaValoracion: '40',
      cesante: true,
      segundaEspecialidad: null,
      puntajeAntiguedad: 12,
      puntajeCursos: 0,
      puntajeDemeritos: -0.5,
      criterioIII: null,
    });
  });

  it('devuelve un cuadro vacío sin data', () => {
    expect(toCuadroMeritos(undefined).filas).toEqual([]);
  });
});
