import { PersonaModel } from '../../../domain/models/Persona.model';
import { BaseResponse } from './BaseResponse,dto';

export interface Perfil {
  idPerfil: number;
  nombre: string;
  rol: string;
}

export interface Usuario {
  /** ID numérico del usuario en BD (registrador). */
  id?: number;
  idUsuario?: number;
  usuario: string;
  clave: string;
  persona: PersonaModel;
  perfiles: Perfil[];
  token: string;
}

export interface LoginResponse extends BaseResponse {
  data: Usuario;
}
