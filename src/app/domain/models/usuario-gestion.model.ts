import { PerfilUsuarioConocido } from '../commons/auth-mappers';

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

/** Petición para que el usuario autenticado cambie su propia contraseña (RF003). */
export interface CambioContrasena {
  claveActual: string;
  nuevaClave: string;
  confirmarClave: string;
}
