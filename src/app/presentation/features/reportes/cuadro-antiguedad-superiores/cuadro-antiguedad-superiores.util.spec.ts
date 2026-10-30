import { FilaCuadroAntiguedadSuperiores } from '../../../../domain/models/cuadro-antiguedad-superiores.model';
import { aFilaCuadroAntiguedadSuperioresVista } from './cuadro-antiguedad-superiores.util';

const ceros = { anios: 0, meses: 0, dias: 0 };

const fila: FilaCuadroAntiguedadSuperiores = {
  orden: 2,
  ordenNacional: 17,
  idMagistrado: '12',
  idFichaValoracion: '40',
  apellidosNombres: 'PEREZ GOMEZ JUAN',
  cesante: true,
  fechaNacimiento: '1962-05-14',
  distritoJudicial: null,
  fechaJuramentoTitular: '2010-03-02',
  horaJuramentoTitular: '10:30:00',
  fechaCese: '2015-03-01',
  tiempoTitularidad: { anios: 4, meses: 11, dias: 27 },
  fechaReincorporacion: '2020-12-31',
  tiempoReincorporacion: { anios: 6, meses: 0, dias: 0 },
  tiempoTotal: { anios: 10, meses: 11, dias: 27 },
  inicioJuezEspecializado: '2001-08-01',
  finJuezEspecializado: '2010-03-01',
  tiempoJuezEspecializado: { anios: 8, meses: 7, dias: 0 },
  inicioProvisional: '2006-01-04',
  finProvisional: null,
  periodosProvisional: 3,
  tiempoProvisional: { anios: 1, meses: 10, dias: 30 },
  fechaColegiatura: '1990-06-20',
  aniosColegiatura: 36,
};

describe('aFilaCuadroAntiguedadSuperioresVista', () => {
  it('formatea fechas, tiempos, orden y hora como el PDF', () => {
    const vista = aFilaCuadroAntiguedadSuperioresVista(fila);

    expect(vista.orden).toBe('2º');
    expect(vista.ordenNacional).toBe(17);
    expect(vista.fechaJuramentoTitular).toBe('02/03/2010');
    expect(vista.fechaCese).toBe('01/03/2015');
    expect(vista.tiempoTitularidad).toBe('04 - 11 - 27');
    expect(vista.fechaReincorporacion).toBe('31/12/2020');
    expect(vista.tiempoReincorporacion).toBe('06 - 00 - 00');
    expect(vista.tiempoTotal).toBe('10 - 11 - 27');
    expect(vista.tiempoJuezEspecializado).toBe('08 - 07 - 00');
    expect(vista.periodosProvisional).toBe('3');
    expect(vista.finProvisional).toBe('-');
    expect(vista.provisionalEnCurso).toBe(true);
    expect(vista.distritoJudicial).toBe('-');
    expect(vista.horaJuramentoTitular).toBe('10:30:00');
  });

  it('muestra "-" en R1, Juez Especializado y Provisionalidad sin dato (no 00 - 00 - 00)', () => {
    const vista = aFilaCuadroAntiguedadSuperioresVista({
      ...fila,
      fechaCese: null,
      fechaReincorporacion: null,
      tiempoReincorporacion: null,
      inicioJuezEspecializado: null,
      finJuezEspecializado: '2010-03-01',
      tiempoJuezEspecializado: ceros,
      periodosProvisional: 0,
      inicioProvisional: '2006-01-04',
      finProvisional: '2009-12-31',
      tiempoProvisional: ceros,
      horaJuramentoTitular: null,
    });

    expect(vista.fechaCese).toBe('-');
    expect([vista.fechaReincorporacion, vista.tiempoReincorporacion]).toEqual(['-', '-']);
    expect([
      vista.inicioJuezEspecializado,
      vista.finJuezEspecializado,
      vista.tiempoJuezEspecializado,
    ]).toEqual(['-', '-', '-']);
    expect([
      vista.inicioProvisional,
      vista.finProvisional,
      vista.periodosProvisional,
      vista.tiempoProvisional,
    ]).toEqual(['-', '-', '-', '-']);
    expect(vista.provisionalEnCurso).toBe(false);
    expect(vista.horaJuramentoTitular).toBe('-');
  });
});
