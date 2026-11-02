import { toCarpetaPersonalMeritos } from './carpeta-personal-meritos.mapper';

describe('carpeta-personal-meritos.mapper', () => {
  it('normaliza los datos del juez: vacíos a null y el id a texto', () => {
    const carpeta = toCarpetaPersonalMeritos({
      idFicha: 40,
      fechaValoracion: '2026-12-31',
      fotoBase64: '  ',
      dni: '12345678',
      apellidosNombres: 'PEREZ GOMEZ JUAN',
      estadoCivil: null,
      correoInstitucional: '',
      secciones: null,
    });

    expect(carpeta).toMatchObject({
      idFicha: '40',
      fotoBase64: null,
      estadoCivil: null,
      correoInstitucional: null,
      secciones: [],
    });
  });

  it('completa anchos y celdas para que cada fila tenga todas las columnas', () => {
    const carpeta = toCarpetaPersonalMeritos({
      secciones: [
        {
          numero: 'V',
          titulo: 'ESTUDIOS DE PERFECCIONAMIENTO',
          tablas: [
            {
              titulo: 'V.2 PASANTÍAS',
              columnas: ['TIPO', 'LUGAR', 'FEC. INICIO'],
              anchos: [14, 0],
              filas: [['NACIONAL', null], []],
            },
          ],
        },
      ],
    });

    expect(carpeta.secciones[0].tablas[0]).toEqual({
      titulo: 'V.2 PASANTÍAS',
      columnas: ['TIPO', 'LUGAR', 'FEC. INICIO'],
      anchos: [14, 1, 1],
      filas: [
        ['NACIONAL', '—', '—'],
        ['—', '—', '—'],
      ],
    });
  });
});
