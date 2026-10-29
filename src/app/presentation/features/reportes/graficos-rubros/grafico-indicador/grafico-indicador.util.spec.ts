import {
  aSerieGrafico,
  esClaveSinDato,
  tituloSerie,
  totalDocumentosPorCaducar,
  unidadSerie,
} from './grafico-indicador.util';

describe('grafico-indicador.util', () => {
  it('escala el ancho de las barras respecto a la mayor cantidad', () => {
    const serie = aSerieGrafico({
      serie: 'TOTAL',
      total: 120,
      items: [
        { clave: 'M', etiqueta: 'Masculino', cantidad: 80, porcentaje: 66.67 },
        { clave: 'F', etiqueta: 'Femenino', cantidad: 40, porcentaje: 33.33 },
      ],
    });

    expect(serie.barras.map((barra) => barra.ancho)).toEqual([100, 50]);
  });

  it('deja ancho 0 si la serie no tiene magistrados', () => {
    const serie = aSerieGrafico({
      serie: 'TOTAL',
      total: 0,
      items: [{ clave: 'M', etiqueta: 'Masculino', cantidad: 0, porcentaje: 0 }],
    });

    expect(serie.barras[0].ancho).toBe(0);
  });

  it('marca las categorías sin dato', () => {
    expect(esClaveSinDato('SIN_REGISTRO')).toBe(true);
    expect(esClaveSinDato('FUERA_DE_RANGO')).toBe(true);
    expect(esClaveSinDato('SIN_SEGUNDA')).toBe(true);
    expect(esClaveSinDato('LIMA')).toBe(false);
  });

  it('traduce los nombres de serie conocidos y humaniza los demás', () => {
    expect(tituloSerie('PRIMERA')).toBe('Primera especialidad');
    expect(tituloSerie('OTRA_SERIE')).toBe('Otra serie');
  });

  it('usa el título de serie propio del indicador cuando existe', () => {
    expect(tituloSerie('TOTAL', 'vigencia-documentos')).toBe('Vigentes y caducados');
    expect(tituloSerie('TOTAL', 'grados-titulos')).toBe('Con / sin registro');
  });

  it('distingue series que cuentan documentos de las que cuentan magistrados', () => {
    expect(unidadSerie('DOCUMENTOS', 'documentos-por-caducar')).toBe('documentos');
    expect(unidadSerie('MAGISTRADOS', 'documentos-por-caducar')).toBe('magistrados');
    expect(unidadSerie('CADUCADOS', 'vigencia-documentos')).toBe('documentos');
    expect(unidadSerie('TOTAL', 'sexo')).toBe('magistrados');
  });

  it('obtiene el total de documentos por caducar de la serie DOCUMENTOS', () => {
    expect(
      totalDocumentosPorCaducar({
        indicador: 'DOCUMENTOS_POR_CADUCAR',
        descripcion: '',
        total: 50,
        series: [
          { serie: 'DOCUMENTOS', total: 14, items: [] },
          { serie: 'MAGISTRADOS', total: 50, items: [] },
        ],
      })
    ).toBe(14);
    expect(totalDocumentosPorCaducar(null)).toBe(0);
  });
});
