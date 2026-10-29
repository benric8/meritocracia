import { BaseResponse } from './BaseResponse,dto';

export interface TiempoAntiguedadDto {
  anios?: number | null;
  meses?: number | null;
  dias?: number | null;
}

export interface FilaCuadroAntiguedadDto {
  orden?: number | null;
  idMagistrado?: number | string | null;
  idFichaValoracion?: number | string | null;
  apellidosNombres?: string | null;
  fechaNacimiento?: string | null;
  fechaJuramentoTitular?: string | null;
  tiempoTitular?: TiempoAntiguedadDto | null;
  inicioJuezSuperior?: string | null;
  finJuezSuperior?: string | null;
  tiempoJuezSuperior?: TiempoAntiguedadDto | null;
  inicioProvisional?: string | null;
  finProvisional?: string | null;
  periodosProvisional?: number | null;
  tiempoProvisional?: TiempoAntiguedadDto | null;
  fechaColegiatura?: string | null;
  aniosColegiatura?: number | null;
}

export interface CuadroAntiguedadDto {
  idFechaValoracion?: number | string | null;
  fechaValoracion?: string | null;
  nota?: string | null;
  filas?: FilaCuadroAntiguedadDto[] | null;
}

export interface CuadroAntiguedadResponse extends BaseResponse {
  data: CuadroAntiguedadDto | null;
}
