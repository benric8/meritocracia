import { BaseResponse } from './BaseResponse,dto';
import { TiempoAntiguedadDto } from './CuadroAntiguedadResponse.dto';

export interface FilaCuadroAntiguedadSuperioresDto {
  orden?: number | null;
  ordenNacional?: number | null;
  idMagistrado?: number | string | null;
  idFichaValoracion?: number | string | null;
  apellidosNombres?: string | null;
  cesante?: boolean | null;
  fechaNacimiento?: string | null;
  idDistritoJudicial?: number | string | null;
  distritoJudicial?: string | null;
  fechaJuramentoTitular?: string | null;
  horaJuramentoTitular?: string | null;
  fechaCese?: string | null;
  tiempoTitularidad?: TiempoAntiguedadDto | null;
  fechaReincorporacion?: string | null;
  tiempoReincorporacion?: TiempoAntiguedadDto | null;
  tiempoTotal?: TiempoAntiguedadDto | null;
  inicioJuezEspecializado?: string | null;
  finJuezEspecializado?: string | null;
  tiempoJuezEspecializado?: TiempoAntiguedadDto | null;
  inicioProvisional?: string | null;
  finProvisional?: string | null;
  periodosProvisional?: number | null;
  tiempoProvisional?: TiempoAntiguedadDto | null;
  fechaColegiatura?: string | null;
  aniosColegiatura?: number | null;
}

export interface CuadroAntiguedadSuperioresDto {
  idFechaValoracion?: number | string | null;
  fechaValoracion?: string | null;
  idDistritoJudicial?: number | string | null;
  distritoJudicial?: string | null;
  notaCesantes?: string | null;
  notaDistrito?: string | null;
  notaProvisional?: string | null;
  filas?: FilaCuadroAntiguedadSuperioresDto[] | null;
}

export interface CuadroAntiguedadSuperioresResponse extends BaseResponse {
  data: CuadroAntiguedadSuperioresDto | null;
}
