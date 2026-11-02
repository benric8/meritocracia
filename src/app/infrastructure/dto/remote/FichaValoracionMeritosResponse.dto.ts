import { BaseResponse } from './BaseResponse,dto';
import { TiempoAntiguedadDto } from './CuadroAntiguedadResponse.dto';

export interface IndicadorFichaMeritosDto {
  descripcion?: string | null;
  cuenta?: boolean | null;
  cantidad?: number | null;
  detalle?: string | null;
  anio?: number | null;
  nota?: number | null;
  puntaje?: number | null;
}

export interface RubroFichaMeritosDto {
  numero?: string | null;
  titulo?: string | null;
  puntajeMaximo?: number | null;
  puntaje?: number | null;
  indicadores?: IndicadorFichaMeritosDto[] | null;
  subrubros?: RubroFichaMeritosDto[] | null;
}

export interface AntiguedadFichaMeritosDto {
  fechaJuramento?: string | null;
  horaJuramento?: string | null;
  fechaCese?: string | null;
  fechaReincorporacion?: string | null;
  fechaValoracion?: string | null;
  tiempo?: TiempoAntiguedadDto | null;
  puntaje?: number | null;
  puntajeMaximo?: number | null;
  cargoAnterior?: string | null;
  tiempoCargoAnterior?: TiempoAntiguedadDto | null;
  periodosProvisional?: number | null;
  tiempoProvisional?: TiempoAntiguedadDto | null;
  fechaColegiatura?: string | null;
  aniosColegiatura?: number | null;
}

export interface FichaValoracionMeritosDto {
  idFicha?: number | string | null;
  idFechaValoracion?: number | string | null;
  fechaCalificacion?: string | null;
  puntajeTotal?: number | null;
  puntajeMaximo?: number | null;
  puntajePositivo?: number | null;
  puntajeDemeritos?: number | null;
  antiguedadAcumulada?: TiempoAntiguedadDto | null;
  idMagistrado?: number | string | null;
  apellidosNombres?: string | null;
  dni?: string | null;
  fechaNacimiento?: string | null;
  edad?: number | null;
  cargo?: string | null;
  distritoJudicial?: string | null;
  primeraEspecialidad?: string | null;
  segundaEspecialidad?: string | null;
  antiguedad?: AntiguedadFichaMeritosDto | null;
  rubros?: RubroFichaMeritosDto[] | null;
}

export interface FichaValoracionMeritosResponse extends BaseResponse {
  data: FichaValoracionMeritosDto | null;
}
