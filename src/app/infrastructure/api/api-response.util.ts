import { constantes } from '../../domain/commons/constants';
import { BaseResponse } from '../dto/remote/BaseResponse,dto';
import { ErrorNegocioApi } from './api-error.model';
import { detalleDesdeRespuestaApi } from './http-error.util';

export function esCodigoExito(codigo: unknown): boolean {
  const normalizado = String(codigo ?? '').padStart(4, '0');
  return normalizado === constantes.RES_COD_EXITO;
}

export function assertRespuestaExitosa(respuesta: BaseResponse): void {
  if (!esCodigoExito(respuesta.codigo)) {
    throw new ErrorNegocioApi(detalleDesdeRespuestaApi(respuesta));
  }
}
