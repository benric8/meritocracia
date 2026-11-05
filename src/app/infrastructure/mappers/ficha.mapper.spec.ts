import {
  ActualizarDatosPersonalesFicha,
  CrearBorradorFicha,
} from '../../domain/models/ficha-valoracion.model';
import {
  toActualizarFichaRequestDto,
  toFichaValoracionDesdeActualizacion,
  toFichaValoracionDesdeCreacion,
} from './ficha.mapper';

const FOTO_ACTUAL = 'data:image/jpeg;base64,/9j/AAA';

const peticion: ActualizarDatosPersonalesFicha = {
  nivelId: '3',
  nivelNombre: 'Juez Superior',
  datosPersonales: {
    dni: '45871293',
    nombreCompleto: '  PEREZ LOPEZ JUAN  ',
    foto: FOTO_ACTUAL,
    fechaNacimiento: '1980-06-20',
    sexo: 'M',
    edad: 45,
  },
};

describe('ficha.mapper: actualizar ficha', () => {
  it('arma el body del PUT sin DNI y sin la foto si no cambió', () => {
    expect(toActualizarFichaRequestDto(peticion, 12, '/9j/AAA')).toEqual({
      cargoMagistradoId: 3,
      usuarioRegistradorId: 12,
      datosPersonalesJuez: {
        nombreCompleto: 'PEREZ LOPEZ JUAN',
        fechaNacimiento: '1980-06-20',
        sexo: 'M',
      },
    });
  });

  it('envía la foto en Base64 puro cuando cambió', () => {
    const body = toActualizarFichaRequestDto(peticion, 12, '');
    expect(body.datosPersonalesJuez.foto).toBe('/9j/AAA');
  });

  it('rechaza un cargo no válido', () => {
    expect(() => toActualizarFichaRequestDto({ ...peticion, nivelId: '' }, 12, null)).toThrow(
      'Cargo de magistrado no válido.'
    );
  });

  it('aplica cargo, edad y puntaje de la respuesta y conserva los rubros', () => {
    const creacion: CrearBorradorFicha = {
      nivelId: '2',
      nivelNombre: 'Juez Especializado',
      fechaValoracionId: '4',
      fechaValoracionSnapshot: '2026-12-31',
      datosPersonales: { ...peticion.datosPersonales, nombreCompleto: 'ANTERIOR' },
    };
    const actual = toFichaValoracionDesdeCreacion(
      {
        idFicha: 40,
        idMagistrado: 12,
        idFechaValoracion: 4,
        idCargoMagistrado: 2,
        idRegistradorPrincipal: 12,
        completado: '0',
        edad: 45,
      },
      creacion
    );

    const ficha = toFichaValoracionDesdeActualizacion(
      actual,
      {
        idFicha: 40,
        idMagistrado: 12,
        idFechaValoracion: 4,
        idCargoMagistrado: 3,
        idRegistradorPrincipal: 12,
        puntaje: 37.5,
        completado: '0',
        edad: 46,
      },
      peticion
    );

    expect(ficha.nivelId).toBe('3');
    expect(ficha.nivelNombre).toBe('Juez Superior');
    expect(ficha.puntajeTotal).toBe(37.5);
    expect(ficha.estado).toBe('BORRADOR');
    expect(ficha.datosPersonales.nombreCompleto).toBe('PEREZ LOPEZ JUAN');
    expect(ficha.datosPersonales.edad).toBe(46);
    expect(ficha.datosPersonales.dni).toBe('45871293');
    expect(ficha.rubroAntiguedad).toBe(actual.rubroAntiguedad);
  });
});
