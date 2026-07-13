import { BaseResponse } from '../dto/remote/BaseResponse,dto';

export { ErrorNegocioApi } from '../../domain/errors/error-negocio-api';

export function esRespuestaApi(body: unknown): body is BaseResponse {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  return 'codigo' in body && 'descripcion' in body;
}
