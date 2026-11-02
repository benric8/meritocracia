import { toFichaValoracionMeritos } from './ficha-valoracion-meritos.mapper';

describe('toFichaValoracionMeritos', () => {
  it('convierte ids a texto, subrubros null a lista vacía y conserva la antigüedad null', () => {
    const ficha = toFichaValoracionMeritos({
      idFicha: 40,
      puntajeTotal: 44.375,
      antiguedad: null,
      antiguedadAcumulada: null,
      rubros: [
        {
          numero: 'III',
          titulo: 'GRADOS',
          puntajeMaximo: 17,
          puntaje: 13,
          subrubros: null,
          indicadores: [{ descripcion: 'Doctorado', cuenta: null, detalle: '  ', puntaje: null }],
        },
      ],
    });

    expect(ficha.idFicha).toBe('40');
    expect(ficha.antiguedad).toBeNull();
    expect(ficha.antiguedadAcumulada).toBeNull();
    expect(ficha.rubros[0].subrubros).toEqual([]);
    expect(ficha.rubros[0].indicadores[0]).toMatchObject({
      cuenta: false,
      cantidad: 0,
      detalle: null,
      puntaje: 0,
    });
  });

  it('sin data devuelve una ficha vacía', () => {
    expect(toFichaValoracionMeritos(null).rubros).toEqual([]);
  });
});
