import { BaseResponse } from './BaseResponse,dto';

type Id = number | string | null;
type Puntaje = number | null;

export interface FilaCuadroMeritosDto {
  orden?: number | null;
  idMagistrado?: Id;
  idFichaValoracion?: Id;
  dni?: string | null;
  apellidosNombres?: string | null;
  cesante?: boolean | null;
  idDistritoJudicial?: Id;
  distritoJudicial?: string | null;
  idPrimeraEspecialidad?: Id;
  primeraEspecialidad?: string | null;
  idSegundaEspecialidad?: Id;
  segundaEspecialidad?: string | null;
  puntajeAntiguedad?: Puntaje;
  puntajeGradosTitulos?: Puntaje;
  puntajeEstudiosAmag?: Puntaje;
  puntajeDoctoradoMaestria?: Puntaje;
  puntajePasantias?: Puntaje;
  puntajeCursos?: Puntaje;
  puntajeExpositor?: Puntaje;
  puntajeAsistenciaEventos?: Puntaje;
  puntajeOfimatica?: Puntaje;
  puntajeIdiomas?: Puntaje;
  puntajePerfeccionamiento?: Puntaje;
  puntajePublicaciones?: Puntaje;
  puntajeDistinciones?: Puntaje;
  puntajeDocencia?: Puntaje;
  puntajeDemeritos?: Puntaje;
  puntajeTotal?: Puntaje;
  criterioI?: Puntaje;
  criterioII?: Puntaje;
  criterioIII?: number | null;
}

export interface CuadroMeritosDto {
  idFechaValoracion?: Id;
  fechaValoracion?: string | null;
  puntajeMaximo?: number | null;
  notaProduccion?: string | null;
  notaCesantes?: string | null;
  filas?: FilaCuadroMeritosDto[] | null;
}

export interface CuadroMeritosResponse extends BaseResponse {
  data: CuadroMeritosDto | null;
}
