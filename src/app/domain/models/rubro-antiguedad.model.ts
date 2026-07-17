import { TiempoServicio } from './tiempo-servicio.model';

/** Datos generales y titularidad actual (criterio base del rubro B). */
export interface TitularidadActual {
  distritoJudicialId: string;
  cargoTitularId: string;
  fechaJuramentacion: string | null;
  horaJuramento: string | null;
  fechaCese: string | null;
  fechaReincorporacion: string | null;
  fechaValoracion: string | null;
  tiempoTotal: TiempoServicio;
  puntaje: number;
  primeraEspecialidadId: string;
  segundaEspecialidadId: string;
}

/** 1.er criterio de desempate: periodo en nivel inmediato anterior. */
export interface PeriodoNivelAnterior {
  nivelInmediatoAnteriorId: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  tiempoTotal: TiempoServicio;
}

/** Periodo de provisionalidad en el nivel titular actual. */
export interface Provisionalidad {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  tiempoTotal: TiempoServicio;
  cargoId: string;
  cargoNombre: string;
  organoJurisdiccional: string;
  documento: string;
}

/** Colegiatura registrada (3.er criterio de desempate). */
export interface Colegiatura {
  id: string;
  colegioId: string;
  colegioNombre: string;
  fechaColegiatura: string;
  anios: number;
}

/**
 * Agregado de UI del rubro B — Antigüedad en el cargo.
 * `id` lo asigna el back al guardar la titularidad; los criterios de desempate lo requieren.
 */
export interface RubroAntiguedad {
  id: string | null;
  titularidad: TitularidadActual;
  periodoNivelAnterior: PeriodoNivelAnterior;
  provisionalidades: Provisionalidad[];
  sumaProvisionalidades: TiempoServicio;
  colegiaturas: Colegiatura[];
}
