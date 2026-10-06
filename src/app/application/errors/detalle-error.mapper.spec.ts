import { ErrorNegocioApi } from '../../domain/errors/error-negocio-api';
import { aDetalleError } from './detalle-error.mapper';

describe('aDetalleError', () => {
  it('extrae detalle de ErrorNegocioApi', () => {
    const error = new ErrorNegocioApi({
      mensaje: 'No permitido',
      codigoOperacion: 'OP-1',
    });

    expect(aDetalleError(error, 'fallback')).toEqual({
      mensaje: 'No permitido',
      codigoOperacion: 'OP-1',
    });
  });

  it('usa message de Error genérico', () => {
    expect(aDetalleError(new Error('Sesión inválida'), 'fallback')).toEqual({
      mensaje: 'Sesión inválida',
    });
  });

  it('usa mensaje por defecto si el error es desconocido', () => {
    expect(aDetalleError(null, 'No se pudo completar')).toEqual({
      mensaje: 'No se pudo completar',
    });
  });
});
