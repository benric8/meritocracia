import { BaseResponse } from './BaseResponse,dto';
import { PaginatedResponseDto } from './PaginatedResponse.dto';

export interface PerfilUsuarioDto {
  idPerfil: number;
  nombre: string;
  rol: string;
}

export interface UsuarioGestionDto {
  id: number;
  usuario: string;
  nombre: string;
  cargo: string;
  dependencia: string;
  email?: string;
  activo: string;
  perfiles: PerfilUsuarioDto[];
}

export interface RegistrarUsuarioResponse extends BaseResponse {
  data: UsuarioGestionDto;
}

export type ListarUsuariosResponse = PaginatedResponseDto<UsuarioGestionDto>;
