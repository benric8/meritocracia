import { constantes } from '../../domain/commons/constants';

export function esCodigoExito(codigo: unknown): boolean {
  const normalizado = String(codigo ?? '').padStart(4, '0');
  return normalizado === constantes.RES_COD_EXITO;
}
