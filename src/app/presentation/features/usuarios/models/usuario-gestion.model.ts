import { PerfilUsuarioConocido } from '../../../../domain/commons/auth-mappers';

export interface UsuarioGestion {
  id: string;
  codigo: string;
  nombreCompleto: string;
  cargo: string;
  dependencia: string;
  funcion: PerfilUsuarioConocido;
  habilitado: boolean;
}

export interface NuevoUsuarioGestion {
  nombreCompleto: string;
  codigo: string;
  funcion: PerfilUsuarioConocido;
  cargo: string;
  dependencia: string;
}
