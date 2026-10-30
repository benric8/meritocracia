import { TiempoAntiguedad } from './cuadro-antiguedad.model';

/** Filtros del Anexo 03; vacío = no se envía el parámetro. */
export interface FiltrosCuadroAntiguedadSuperiores {
  /** Vacío: el backend usa la fecha de valoración activa. */
  idFechaValoracion: string;
  /** Vacío: cuadro nacional. Con valor: cuadro de esa Corte Superior. */
  idDistritoJudicial: string;
}

export const FILTROS_CUADRO_ANTIGUEDAD_SUPERIORES_VACIOS: FiltrosCuadroAntiguedadSuperiores = {
  idFechaValoracion: '',
  idDistritoJudicial: '',
};

/** Fila del Anexo 03: fechas `yyyy-MM-dd`, hora `HH:mm:ss`; cualquiera puede faltar. */
export interface FilaCuadroAntiguedadSuperiores {
  /** Posición dentro del cuadro pedido (empieza en 1 al filtrar por Corte). */
  orden: number;
  /** Posición en el cuadro nacional (igual a `orden` en el nacional). */
  ordenNacional: number;
  idMagistrado: string;
  idFichaValoracion: string;
  apellidosNombres: string;
  cesante: boolean;
  fechaNacimiento: string | null;
  distritoJudicial: string | null;
  fechaJuramentoTitular: string | null;
  horaJuramentoTitular: string | null;
  fechaCese: string | null;
  tiempoTitularidad: TiempoAntiguedad | null;
  fechaReincorporacion: string | null;
  /** `null` = sin reincorporación (R1 se muestra en `-`). */
  tiempoReincorporacion: TiempoAntiguedad | null;
  tiempoTotal: TiempoAntiguedad | null;
  inicioJuezEspecializado: string | null;
  finJuezEspecializado: string | null;
  /** Llega en ceros aunque no haya dato: manda `inicioJuezEspecializado`. */
  tiempoJuezEspecializado: TiempoAntiguedad | null;
  inicioProvisional: string | null;
  /** `null` con periodos > 0: el último periodo provisional sigue abierto. */
  finProvisional: string | null;
  periodosProvisional: number | null;
  /** Llega en ceros aunque no haya dato: manda `periodosProvisional`. */
  tiempoProvisional: TiempoAntiguedad | null;
  fechaColegiatura: string | null;
  aniosColegiatura: number | null;
}

/** Cuadro de Antigüedad de Jueces Superiores Titulares (RF007 — Submenú D, Anexo 03). */
export interface CuadroAntiguedadSuperiores {
  idFechaValoracion: string;
  fechaValoracion: string;
  /** Vacío en el cuadro nacional. */
  idDistritoJudicial: string;
  /** `null` en el nacional o cuando no hay filas. */
  distritoJudicial: string | null;
  /** `null` cuando ninguna fila es de un cesante. */
  notaCesantes: string | null;
  notaDistrito: string;
  notaProvisional: string;
  /** Ya ordenadas por precedencia con los criterios de desempate. */
  filas: FilaCuadroAntiguedadSuperiores[];
}
