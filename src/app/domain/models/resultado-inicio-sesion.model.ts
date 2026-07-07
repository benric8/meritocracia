import { Perfil, Usuario } from '../../infrastructure/dto/remote/LoginResponse.dto';

/** Resultado del caso de uso de inicio de sesión (credenciales). */
export type ResultadoInicioSesion =
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'sin_perfiles'; mensaje: string }
  | { tipo: 'seleccion_perfil'; usuario: string; datosUsuario: Usuario; perfiles: Perfil[] }
  | { tipo: 'sesion_completa'; usuario: string };
