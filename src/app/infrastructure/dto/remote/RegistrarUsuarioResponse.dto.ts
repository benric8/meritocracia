import { BaseResponse } from './BaseResponse,dto';
import { PaginatedResponseDto } from './PaginatedResponse.dto';

export interface PerfilUsuarioDto {
  id: number;
  nombre: string;
  rol: string;
  activo: string;
}

export interface UsuarioGestionDto {
  id: number;
  usuario: string;
  nombreCompleto: string;
  cargo: string;
  dependencia: string;
  email?: string;
  activo: string;
  perfil: PerfilUsuarioDto;
}

export interface RegistrarUsuarioResponse extends BaseResponse {
  data: UsuarioGestionDto;
}

export type ListarUsuariosResponse = PaginatedResponseDto<UsuarioGestionDto>;
