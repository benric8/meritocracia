import { PersonaModel } from '../../models/Persona.model';
import { BaseResponse } from './BaseResponse,dto';

export interface Perfil {
  idPerfil: number;
  nombre: string;
  rol: string;
}

export interface Usuario {
  usuario: string;
  clave: string;
  persona: PersonaModel;
  perfiles: Perfil[];
  token: string;
}

export interface LoginResponse extends BaseResponse {
  data: Usuario;
}
