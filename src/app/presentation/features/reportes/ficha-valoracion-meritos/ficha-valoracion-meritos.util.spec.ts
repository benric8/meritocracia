import { FichaValoracionMeritos } from '../../../../domain/models/ficha-valoracion-meritos.model';
import {
  aNombrePropio,
  aOracion,
  fichaVista,
  formatearHora,
  formatearTiempoCorto,
  formatearTiempoLargo,
  puntajeVista,
} from './ficha-valoracion-meritos.util';

const rubro = (numero: string, titulo: string, puntaje: number, puntajeMaximo: number | null) => ({
  numero,
  titulo,
  puntaje,
  puntajeMaximo,
  indicadores: [],
  subrubros: [],
});

const indicador = (descripcion: string, puntaje: number, detalle: string | null = null) => ({
  descripcion,
  cuenta: puntaje !== 0,
  cantidad: puntaje !== 0 ? 1 : 0,
  detalle,
  anio: null,
  nota: null,
  puntaje,
});

const fichaEjemplo: FichaValoracionMeritos = {
  idFicha: '40',
  idFechaValoracion: '3',
  fechaCalificacion: '2024-12-31',
  puntajeTotal: 25,
  puntajeMaximo: 60,
  puntajePositivo: 25,
  puntajeDemeritos: 0,
  antiguedadAcumulada: { anios: 11, meses: 8, dias: 22 },
  idMagistrado: '12',
  apellidosNombres: 'ESPINOZA AVENDAÑO RENE EDGAR',
  dni: '12345678',
  fechaNacimiento: '1968-03-04',
  edad: 56,
  cargo: 'JUEZ SUPERIOR',
  distritoJudicial: 'HUANCAVELICA',
  primeraEspecialidad: 'CIVIL',
  segundaEspecialidad: null,
  antiguedad: {
    fechaJuramento: '2013-04-10',
    horaJuramento: '11:15:00',
    fechaCese: null,
    fechaReincorporacion: null,
    fechaValoracion: '2024-12-31',
    tiempo: { anios: 11, meses: 8, dias: 22 },
    puntaje: 6.5,
    puntajeMaximo: 12,
    cargoAnterior: 'JUEZ ESPECIALIZADO TITULAR',
    tiempoCargoAnterior: { anios: 9, meses: 4, dias: 22 },
    periodosProvisional: 3,
    tiempoProvisional: { anios: 4, meses: 1, dias: 7 },
    fechaColegiatura: '1996-10-16',
    aniosColegiatura: 28,
  },
  rubros: [
    rubro('I', 'PRODUCCIÓN JURISDICCIONAL (Suspendido mediante la R.A. 031-2013-CE-PJ)', 0, null),
    rubro('II', 'ANTIGÜEDAD EN EL GRADO DE JUEZ', 6.5, 12),
    {
      ...rubro('III', 'GRADOS ACADÉMICOS Y TÍTULOS PROFESIONALES', 0, 17),
      indicadores: [indicador('Doctorado jurídico', 0)],
    },
    {
      ...rubro('V', 'ESTUDIOS DE PERFECCIONAMIENTO', 3, 14),
      subrubros: [
        { ...rubro('V.2', 'PASANTÍAS', 0, 1.5), indicadores: [indicador('Pasantías', 0)] },
        {
          ...rubro('V.3', 'CURSOS DE ESPECIALIZACIÓN', 3, 3),
          indicadores: [indicador('Cursos', 3, '10 cursos')],
        },
      ],
    },
    {
      ...rubro('VII', 'DISTINCIONES Y CONDECORACIONES', 3, 3),
      indicadores: [{ ...indicador('Distinciones y condecoraciones', 3), cantidad: 18 }],
    },
    rubro('IX', 'DEMÉRITOS', 0, null),
  ],
};

describe('ficha-valoracion-meritos.util', () => {
  it('arma los datos del juez y el puntaje total', () => {
    expect(fichaVista(fichaEjemplo)).toMatchObject({
      nombre: 'Espinoza Avendaño Rene Edgar',
      cargo: 'Juez Superior',
      distrito: 'D.J. Huancavelica',
      nacimiento: '04/03/1968 · 56 años',
      primeraEspecialidad: 'Civil',
      segundaEspecialidad: null,
      antiguedadGrado: '11a 8m 22d',
      calificadoAl: '31/12/2024',
      total: '25.000',
      maximo: '60.000',
      produccion: {
        titulo: 'Producción jurisdiccional',
        nota: 'Suspendido mediante la R.A. 031-2013-CE-PJ',
      },
    });
  });

  it('II al V llevan tabla; VI al IX, tarjetas de resumen', () => {
    const vista = fichaVista(fichaEjemplo);

    expect(vista.factores.map((f) => [f.numero, f.titulo, f.puntaje.valor, f.puntaje.maximo])).toEqual([
      ['II', 'Antigüedad en el grado de juez', '6.500', '12'],
      ['III', 'Grados académicos y títulos profesionales', '0.000', '17'],
      ['V', 'Estudios de perfeccionamiento', '3.000', '14'],
    ]);
    expect(vista.otros.map((o) => [o.numero, o.conceptos, o.avance, o.sinRegistros])).toEqual([
      ['VII', [{ etiqueta: 'Distinciones y condecoraciones', valor: '18' }], 100, 'Sin registros'],
      ['IX', [], null, 'Sin medidas disciplinarias vigentes'],
    ]);
  });

  it('separa el detalle en conceptos aunque los nombres lleven comas', () => {
    const vista = fichaVista({
      ...fichaEjemplo,
      rubros: [
        {
          ...rubro('VII', 'DISTINCIONES Y CONDECORACIONES', 1.5, 3),
          indicadores: [
            indicador(
              'Distinciones y condecoraciones',
              1.5,
              'Elección de Presidente de Corte, Consejero, Jefe de ODECMA: 1, Importante por el quehacer jurisdiccional: 2'
            ),
          ],
        },
        {
          ...rubro('VI', 'PUBLICACIONES', 0.5, 3),
          indicadores: [indicador('Publicaciones', 0.5, 'Nacionales: 1 / Internacionales: 0')],
        },
      ],
    });

    expect(vista.otros[0]).toMatchObject({
      avance: 50,
      conceptos: [
        { etiqueta: 'Elección de Presidente de Corte, Consejero, Jefe de ODECMA', valor: '1' },
        { etiqueta: 'Importante por el quehacer jurisdiccional', valor: '2' },
      ],
    });
    expect(vista.otros[1].conceptos).toEqual([
      { etiqueta: 'Nacionales', valor: '1' },
      { etiqueta: 'Internacionales', valor: '0' },
    ]);
  });

  it('en V cada subrubro es una fila con su tope; las que no suman van al final', () => {
    const v = fichaVista(fichaEjemplo).factores[2];

    expect(v.sinPuntaje).toBe(1);
    expect(v.indicadores).toEqual([
      expect.objectContaining({
        descripcion: 'Cursos de especialización',
        cuenta: true,
        detalle: '10 cursos',
        vacio: false,
        puntaje: { valor: '3.000', maximo: '3', negativo: false },
      }),
      expect.objectContaining({
        descripcion: 'Pasantías',
        cuenta: false,
        detalle: '—',
        vacio: true,
        puntaje: { valor: '0.000', maximo: '1.5', negativo: false },
      }),
    ]);
  });

  it('el factor II trae el cargo evaluado y los cuatro criterios de desempate', () => {
    const antiguedad = fichaVista(fichaEjemplo).factores[0].antiguedad!;

    expect(antiguedad).toMatchObject({
      cargo: 'Juez Superior',
      fechaInicio: '10/04/2013',
      fechaCese: '—',
      fechaFin: '31/12/2024',
      tiempo: '11a 8m 22d',
    });
    expect(antiguedad.criterios.map((c) => [c.titulo, c.valor, c.detalle])).toEqual([
      [
        'Tiempo en el cargo anterior',
        '9 años, 4 meses y 22 días',
        'Como Juez Especializado Titular',
      ],
      ['Provisionalidad en el nivel actual', '4 años, 1 mes y 7 días', 'Suma de 3 periodos'],
      ['Antigüedad en la colegiatura', '28 años', 'Colegiado desde el 16/10/1996'],
      ['Hora de juramento', '11:15 h', 'Juramentó el 10/04/2013'],
    ]);
  });

  it('tiempos y horas legibles en los criterios de desempate', () => {
    expect(formatearTiempoLargo({ anios: 2, meses: 5, dias: 0 })).toBe('2 años y 5 meses');
    expect(formatearTiempoLargo({ anios: 1, meses: 0, dias: 1 })).toBe('1 año y 1 día');
    expect(formatearTiempoLargo({ anios: 0, meses: 0, dias: 0 })).toBe('0 días');
    expect(formatearTiempoLargo(null)).toBe('—');
    expect(formatearHora('15:30:00')).toBe('15:30');
    expect(formatearHora('15:30:45')).toBe('15:30:45');
  });

  it('sin antigüedad registrada el factor II no trae tablas', () => {
    const vista = fichaVista({ ...fichaEjemplo, antiguedad: null, antiguedadAcumulada: null });

    expect(vista.factores[0]).toMatchObject({ esAntiguedad: true, antiguedad: null });
    expect(vista.antiguedadGrado).toBe('—');
  });

  it('deméritos registrados: resumen y puntaje negativo', () => {
    const vista = fichaVista({
      ...fichaEjemplo,
      puntajeDemeritos: -0.5,
      rubros: [
        { ...rubro('IX', 'DEMÉRITOS', -0.5, null), indicadores: [indicador('Amonestaciones', -0.5)] },
      ],
    });

    expect(vista.otros[0]).toMatchObject({
      esDemeritos: true,
      avance: null,
      conceptos: [{ etiqueta: 'Amonestaciones', valor: '1' }],
      puntaje: { valor: '-0.500', maximo: '', negativo: true },
    });
    expect(vista.demeritos).toEqual({ valor: '-0.500', maximo: '', negativo: true });
  });

  it('formatos de texto y puntaje', () => {
    expect(aOracion('ESTUDIOS EN LA AMAG (R.A. 031-2013-CE-PJ)')).toBe(
      'Estudios en la AMAG (R.A. 031-2013-CE-PJ)'
    );
    expect(aNombrePropio('ÑAÑEZ DE LA CRUZ')).toBe('Ñañez De La Cruz');
    expect(formatearTiempoCorto({ anios: 4, meses: 1, dias: 7 })).toBe('4a 1m 7d');
    expect(puntajeVista(6.5, 12)).toEqual({ valor: '6.500', maximo: '12', negativo: false });
  });
});
