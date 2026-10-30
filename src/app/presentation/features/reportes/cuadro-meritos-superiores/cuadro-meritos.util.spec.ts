import { FilaCuadroMeritos } from '../../../../domain/models/cuadro-meritos.model';
import { aFilaCuadroMeritosVista, formatearPuntaje } from './cuadro-meritos.util';

const fila: FilaCuadroMeritos = {
  orden: 17,
  idMagistrado: '12',
  idFichaValoracion: '40',
  dni: '12345678',
  apellidosNombres: 'PEREZ GOMEZ JUAN',
  cesante: false,
  distritoJudicial: 'LIMA',
  primeraEspecialidad: 'CIVIL',
  segundaEspecialidad: null,
  puntajeAntiguedad: 12,
  puntajeGradosTitulos: 7,
  puntajeEstudiosAmag: 4,
  puntajeDoctoradoMaestria: 1.5,
  puntajePasantias: 0,
  puntajeCursos: 1.25,
  puntajeExpositor: 0,
  puntajeAsistenciaEventos: 0,
  puntajeOfimatica: 0,
  puntajeIdiomas: 1,
  puntajePerfeccionamiento: 3.75,
  puntajePublicaciones: 0,
  puntajeDistinciones: 0,
  puntajeDocencia: 2.625,
  puntajeDemeritos: -0.5,
  puntajeTotal: 28.875,
  criterioI: 16.875,
  criterioII: -0.5,
  criterioIII: 3,
};

describe('cuadro-meritos.util', () => {
  it('formatea puntajes con tres decimales y punto', () => {
    expect(formatearPuntaje(12)).toBe('12.000');
    expect(formatearPuntaje(-0.5)).toBe('-0.500');
    expect(formatearPuntaje(1234.5)).toBe('1234.500');
    expect(formatearPuntaje(null)).toBe('0.000');
  });

  it('arma las 18 columnas de puntaje en el orden del Anexo 02', () => {
    const vista = aFilaCuadroMeritosVista(fila);

    expect(vista.orden).toBe('17º');
    expect(vista.segundaEspecialidad).toBe('-');
    expect(vista.puntajes).toHaveLength(18);
    expect(vista.puntajes[0]).toMatchObject({ campo: 'puntajeAntiguedad', valor: '12.000' });
    expect(vista.puntajes.find((c) => c.campo === 'puntajeTotal')).toMatchObject({
      valor: '28.875',
      total: true,
    });
    expect(vista.puntajes.filter((c) => c.negativo).map((c) => c.campo)).toEqual([
      'puntajeDemeritos',
      'criterioII',
    ]);
    expect(vista.criterioIII).toBe('3');
  });

  it('usa "-" para el criterio III sin ficha de antigüedad', () => {
    expect(aFilaCuadroMeritosVista({ ...fila, criterioIII: null }).criterioIII).toBe('-');
  });
});
