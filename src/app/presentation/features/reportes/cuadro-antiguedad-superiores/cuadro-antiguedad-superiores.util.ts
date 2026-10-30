import { FilaCuadroAntiguedadSuperiores } from '../../../../domain/models/cuadro-antiguedad-superiores.model';
import {
  formatearFechaCuadro,
  formatearTiempoCuadro,
} from '../cuadro-antiguedad-supremos/cuadro-antiguedad.util';

const SIN_DATO = '-';

/** Fila lista para pintar: mismas reglas de formato que el Excel y el PDF del Anexo 03. */
export interface FilaCuadroAntiguedadSuperioresVista {
  clave: string;
  orden: string;
  ordenNacional: number;
  apellidosNombres: string;
  cesante: boolean;
  fechaNacimiento: string;
  distritoJudicial: string;
  fechaJuramentoTitular: string;
  fechaCese: string;
  tiempoTitularidad: string;
  fechaReincorporacion: string;
  tiempoReincorporacion: string;
  tiempoTotal: string;
  inicioJuezEspecializado: string;
  finJuezEspecializado: string;
  tiempoJuezEspecializado: string;
  inicioProvisional: string;
  finProvisional: string;
  /** El último periodo provisional sigue abierto (fin en `null` con periodos > 0). */
  provisionalEnCurso: boolean;
  periodosProvisional: string;
  tiempoProvisional: string;
  fechaColegiatura: string;
  aniosColegiatura: string;
  horaJuramentoTitular: string;
}

/**
 * R1, Juez Especializado y Provisionalidad van en `-` cuando no hay dato:
 * el backend manda sus tiempos en ceros, no en `null`.
 */
export function aFilaCuadroAntiguedadSuperioresVista(
  fila: FilaCuadroAntiguedadSuperiores
): FilaCuadroAntiguedadSuperioresVista {
  const conR1 = fila.tiempoReincorporacion != null;
  const conEspecializado = fila.inicioJuezEspecializado != null;
  const periodos = fila.periodosProvisional ?? 0;
  const conProvisional = periodos > 0;
  const siHay = (condicion: boolean, valor: string) => (condicion ? valor : SIN_DATO);

  return {
    clave: fila.idFichaValoracion || fila.idMagistrado || String(fila.orden),
    orden: `${fila.orden}º`,
    ordenNacional: fila.ordenNacional,
    apellidosNombres: fila.apellidosNombres,
    cesante: fila.cesante,
    fechaNacimiento: formatearFechaCuadro(fila.fechaNacimiento),
    distritoJudicial: fila.distritoJudicial || SIN_DATO,
    fechaJuramentoTitular: formatearFechaCuadro(fila.fechaJuramentoTitular),
    fechaCese: formatearFechaCuadro(fila.fechaCese),
    tiempoTitularidad: formatearTiempoCuadro(fila.tiempoTitularidad),
    fechaReincorporacion: siHay(conR1, formatearFechaCuadro(fila.fechaReincorporacion)),
    tiempoReincorporacion: siHay(conR1, formatearTiempoCuadro(fila.tiempoReincorporacion)),
    tiempoTotal: formatearTiempoCuadro(fila.tiempoTotal),
    inicioJuezEspecializado: siHay(
      conEspecializado,
      formatearFechaCuadro(fila.inicioJuezEspecializado)
    ),
    finJuezEspecializado: siHay(conEspecializado, formatearFechaCuadro(fila.finJuezEspecializado)),
    tiempoJuezEspecializado: siHay(
      conEspecializado,
      formatearTiempoCuadro(fila.tiempoJuezEspecializado)
    ),
    inicioProvisional: siHay(conProvisional, formatearFechaCuadro(fila.inicioProvisional)),
    finProvisional: siHay(conProvisional, formatearFechaCuadro(fila.finProvisional)),
    provisionalEnCurso: conProvisional && !fila.finProvisional,
    periodosProvisional: siHay(conProvisional, String(periodos)),
    tiempoProvisional: siHay(conProvisional, formatearTiempoCuadro(fila.tiempoProvisional)),
    fechaColegiatura: formatearFechaCuadro(fila.fechaColegiatura),
    aniosColegiatura: fila.aniosColegiatura == null ? SIN_DATO : String(fila.aniosColegiatura),
    horaJuramentoTitular: fila.horaJuramentoTitular || SIN_DATO,
  };
}
