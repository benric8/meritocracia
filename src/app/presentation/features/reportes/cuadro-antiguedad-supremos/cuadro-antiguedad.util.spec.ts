import { FilaCuadroAntiguedad } from '../../../../domain/models/cuadro-antiguedad.model';
import {
  aFilaCuadroVista,
  formatearFechaCuadro,
  formatearTiempoCuadro,
} from './cuadro-antiguedad.util';

const filaBase: FilaCuadroAntiguedad = {
  orden: 1,
  idMagistrado: '12',
  idFichaValoracion: '40',
  apellidosNombres: 'PEREZ GOMEZ JUAN',
  fechaNacimiento: '1960-05-14',
  fechaJuramentoTitular: '2015-03-02',
  tiempoTitular: { anios: 11, meses: 9, dias: 29 },
  inicioJuezSuperior: '2004-08-01',
  finJuezSuperior: '2015-03-01',
  tiempoJuezSuperior: { anios: 10, meses: 7, dias: 0 },
  inicioProvisional: '2010-01-04',
  finProvisional: '2014-12-31',
  periodosProvisional: 3,
  tiempoProvisional: { anios: 2, meses: 4, dias: 17 },
  fechaColegiatura: '1985-06-20',
  aniosColegiatura: 41,
};

describe('cuadro-antiguedad.util', () => {
  it('formatea fechas como texto sin desfase de zona horaria', () => {
    expect(formatearFechaCuadro('2026-12-31')).toBe('31/12/2026');
    expect(formatearFechaCuadro(null)).toBe('-');
  });

  it('formatea tiempos con dos dígitos', () => {
    expect(formatearTiempoCuadro({ anios: 2, meses: 4, dias: 7 })).toBe('02 - 04 - 07');
    expect(formatearTiempoCuadro(null)).toBe('-');
  });

  it('pinta la fila completa del Anexo 01', () => {
    expect(aFilaCuadroVista(filaBase)).toMatchObject({
      clave: '40',
      orden: '1º',
      fechaNacimiento: '14/05/1960',
      tiempoTitular: '11 - 09 - 29',
      tiempoJuezSuperior: '10 - 07 - 00',
      periodosProvisional: '3',
      tiempoProvisional: '02 - 04 - 17',
      provisionalEnCurso: false,
      aniosColegiatura: '41',
    });
  });

  it('usa "-" sin Juez Superior ni periodos provisionales', () => {
    const vista = aFilaCuadroVista({
      ...filaBase,
      inicioJuezSuperior: null,
      periodosProvisional: 0,
      aniosColegiatura: null,
    });

    expect(vista.tiempoJuezSuperior).toBe('-');
    expect(vista.periodosProvisional).toBe('-');
    expect(vista.tiempoProvisional).toBe('-');
    expect(vista.aniosColegiatura).toBe('-');
  });

  it('marca el periodo provisional en curso', () => {
    const vista = aFilaCuadroVista({ ...filaBase, finProvisional: null });
    expect(vista.finProvisional).toBe('-');
    expect(vista.provisionalEnCurso).toBe(true);
  });
});
