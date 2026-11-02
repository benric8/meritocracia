import { BaseResponse } from './BaseResponse,dto';

export interface TablaCarpetaMeritosDto {
  titulo?: string | null;
  columnas?: string[] | null;
  anchos?: number[] | null;
  filas?: (string | null)[][] | null;
}

export interface SeccionCarpetaMeritosDto {
  numero?: string | null;
  titulo?: string | null;
  nota?: string | null;
  tablas?: TablaCarpetaMeritosDto[] | null;
}

export interface CarpetaPersonalMeritosDto {
  idFicha?: number | string | null;
  fechaValoracion?: string | null;
  fotoBase64?: string | null;
  dni?: string | null;
  apellidosNombres?: string | null;
  sexo?: string | null;
  estadoCivil?: string | null;
  fechaNacimiento?: string | null;
  edad?: number | null;
  distritoJudicial?: string | null;
  despachoJudicial?: string | null;
  cargo?: string | null;
  condicion?: string | null;
  primeraEspecialidad?: string | null;
  segundaEspecialidad?: string | null;
  anexoTelefonico?: string | null;
  correoInstitucional?: string | null;
  secciones?: SeccionCarpetaMeritosDto[] | null;
}

export interface CarpetaPersonalMeritosResponse extends BaseResponse {
  data: CarpetaPersonalMeritosDto | null;
}
