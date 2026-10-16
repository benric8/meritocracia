import { BaseResponse } from './BaseResponse,dto';
import { PaginatedResponseDto } from './PaginatedResponse.dto';

/**
 * Fila de `GET suplencias`. El backend omite los nulos: si la ficha no tiene
 * suplente, los campos de suplencia no vienen en el JSON.
 */
export interface SuplenciaFichaDto {
  idFicha: number;
  fechaValoracion?: string;
  idRegistradorTitular: number;
  codigoRegistradorTitular?: string;
  nombreRegistradorTitular?: string;
  dniMagistrado?: string | number;
  nombreMagistrado?: string;
  idSuplencia?: number;
  idRegistradorSuplente?: number;
  codigoRegistradorSuplente?: string;
  nombreRegistradorSuplente?: string;
  motivo?: string;
  motivoDescripcion?: string;
  fechaInicioSuplencia?: string;
}

export type ListarSuplenciasResponse = PaginatedResponseDto<SuplenciaFichaDto>;

export interface RegistradorSuplenteDto {
  idUsuario: number;
  usuario?: string;
  nombreCompleto?: string;
}

export interface RegistradoresSuplentesResponse extends BaseResponse {
  data?: RegistradorSuplenteDto[];
}

export interface MotivoSuplenciaDto {
  codigo: string;
  descripcion?: string;
}

export interface MotivosSuplenciaResponse extends BaseResponse {
  data?: MotivoSuplenciaDto[];
}

/** Body de `PUT suplencias/{idFicha}`. */
export interface AsignarSuplenciaRequest {
  registradorSuplenteId: number;
  motivo: string;
}

export interface SuplenciaAsignadaDto {
  idSuplencia: number;
  idFicha: number;
  idRegistradorSuplente: number;
  motivo: string;
  motivoDescripcion?: string;
  fechaInicio?: string;
  usuarioAsigna?: string;
}

export interface AsignarSuplenciaResponse extends BaseResponse {
  data: SuplenciaAsignadaDto;
}
