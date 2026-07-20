import { BaseResponse } from './BaseResponse,dto';

/** Respuesta de GET /fichas/flujo. */
export type FlujoFichaApi =
  | 'NUEVA'
  | 'NUEVA_CON_DATA_PREVIA'
  | 'EDITABLE'
  | 'NO_EDITABLE'
  | 'ASIGNADO_A_OTRO';

export interface FlujoFichaDto {
  flujo: FlujoFichaApi | string;
  idMagistrado: number | null;
  idFicha: number | null;
  idFichaPrevia: number | null;
  completado: string | null;
}

export interface FlujoFichaResponse extends BaseResponse {
  data: FlujoFichaDto;
}

export interface DatosPersonalesJuezRequestDto {
  dni: string;
  nombreCompleto: string;
  foto: string;
  fechaNacimiento: string;
  sexo: string;
}

export interface CrearFichaRequestDto {
  cargoMagistradoId: number;
  fechaValoracionId: number;
  importarDesdeFichaId: number | null;
  usuarioRegistradorId: number;
  datosPersonalesJuez: DatosPersonalesJuezRequestDto;
}

export interface CrearFichaDataDto {
  idFicha: number;
  idMagistrado: number;
  idFechaValoracion: number;
  idCargoMagistrado: number;
  idRegistradorPrincipal: number;
  completado: string;
  edad: number;
}

export interface CrearFichaResponse extends BaseResponse {
  data: CrearFichaDataDto;
}
