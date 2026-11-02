import { TiempoAntiguedad } from './cuadro-antiguedad.model';

/** Fila de detalle de un rubro o subrubro; `detalle` ya viene redactado por el backend. */
export interface IndicadorFichaMeritos {
  descripcion: string;
  cuenta: boolean;
  cantidad: number;
  detalle: string | null;
  anio: number | null;
  nota: number | null;
  /** Cero o negativo en el rubro IX (deméritos). */
  puntaje: number;
}

/** Rubro (I al IX) o subrubro (V.1 al V.7) con su puntaje ya calculado. */
export interface RubroFichaMeritos {
  numero: string;
  titulo: string;
  /** `null` en I y IX: no tienen tope. */
  puntajeMaximo: number | null;
  puntaje: number;
  indicadores: IndicadorFichaMeritos[];
  /** Solo el rubro V trae subrubros; en los demás va vacío. */
  subrubros: RubroFichaMeritos[];
}

/** Detalle del rubro II (antigüedad) y criterios de desempate. */
export interface AntiguedadFichaMeritos {
  fechaJuramento: string | null;
  horaJuramento: string | null;
  fechaCese: string | null;
  fechaReincorporacion: string | null;
  fechaValoracion: string | null;
  tiempo: TiempoAntiguedad | null;
  puntaje: number;
  puntajeMaximo: number | null;
  /** `null` si no hay periodo anterior. */
  cargoAnterior: string | null;
  tiempoCargoAnterior: TiempoAntiguedad | null;
  periodosProvisional: number;
  tiempoProvisional: TiempoAntiguedad | null;
  fechaColegiatura: string | null;
  aniosColegiatura: number | null;
}

/** Ficha de Valoración de Méritos (RF007 — Submenú E, Anexo 04). */
export interface FichaValoracionMeritos {
  idFicha: string;
  idFechaValoracion: string;
  fechaCalificacion: string;
  puntajeTotal: number;
  puntajeMaximo: number;
  /** Suma de los rubros II al VIII. */
  puntajePositivo: number;
  /** Rubro IX (cero o negativo). */
  puntajeDemeritos: number;
  antiguedadAcumulada: TiempoAntiguedad | null;
  idMagistrado: string;
  apellidosNombres: string;
  dni: string;
  fechaNacimiento: string | null;
  edad: number | null;
  cargo: string | null;
  distritoJudicial: string | null;
  primeraEspecialidad: string | null;
  segundaEspecialidad: string | null;
  /** `null` si la ficha no tiene antigüedad registrada. */
  antiguedad: AntiguedadFichaMeritos | null;
  /** Siempre los nueve rubros, del I al IX y en ese orden. */
  rubros: RubroFichaMeritos[];
}
