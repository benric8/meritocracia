import { toIndicadorDashboard } from './dashboard-rubros.mapper';

describe('dashboard-rubros.mapper', () => {
  it('mapea el indicador con sus series e ítems', () => {
    const indicador = toIndicadorDashboard({
      indicador: 'SEXO',
      descripcion: 'Distribución de jueces por sexo',
      total: 120,
      series: [
        {
          serie: 'TOTAL',
          total: 120,
          items: [
            { clave: 'M', etiqueta: 'Masculino', cantidad: 70, porcentaje: 58.33 },
            { clave: 'F', etiqueta: 'Femenino', cantidad: 50, porcentaje: 41.67 },
          ],
        },
      ],
    });

    expect(indicador.total).toBe(120);
    expect(indicador.series).toHaveLength(1);
    expect(indicador.series[0].items[0]).toEqual({
      clave: 'M',
      etiqueta: 'Masculino',
      cantidad: 70,
      porcentaje: 58.33,
    });
  });

  it('tolera campos omitidos por el backend', () => {
    const indicador = toIndicadorDashboard({
      series: [{ items: [{ clave: 'SIN_REGISTRO' }] }],
    });

    expect(indicador.total).toBe(0);
    expect(indicador.series[0].serie).toBe('');
    expect(indicador.series[0].items[0]).toEqual({
      clave: 'SIN_REGISTRO',
      etiqueta: 'SIN_REGISTRO',
      cantidad: 0,
      porcentaje: 0,
    });
  });

  it('devuelve un indicador vacío si no hay data', () => {
    expect(toIndicadorDashboard(undefined)).toEqual({
      indicador: '',
      descripcion: '',
      total: 0,
      series: [],
    });
  });
});
