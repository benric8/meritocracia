import {
  FilaCuadroAntiguedad,
  TiempoAntiguedad,
} from '../../../../domain/models/cuadro-antiguedad.model';

const SIN_DATO = '-';

/** Fila lista para pintar: mismas reglas de formato que el Excel y el PDF del Anexo 01. */
export interface FilaCuadroVista {
  clave: string;
  orden: string;
  apellidosNombres: string;
  fechaNacimiento: string;
  fechaJuramentoTitular: string;
  tiempoTitular: string;
  inicioJuezSuperior: string;
  finJuezSuperior: string;
  tiempoJuezSuperior: string;
  inicioProvisional: string;
  finProvisional: string;
  /** El último periodo provisional sigue abierto (fin en `null` con periodos > 0). */
  provisionalEnCurso: boolean;
  periodosProvisional: string;
  tiempoProvisional: string;
  fechaColegiatura: string;
  aniosColegiatura: string;
}

/** `yyyy-MM-dd` → `dd/MM/yyyy` como texto: `new Date()` lo leería en UTC (un día antes en Perú). */
export function formatearFechaCuadro(iso: string | null | undefined): string {
  if (!iso) {
    return SIN_DATO;
  }
  const [anio, mes, dia] = iso.slice(0, 10).split('-');
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : SIN_DATO;
}

/** `{ anios, meses, dias }` → `aa - mm - dd` con dos dígitos. */
export function formatearTiempoCuadro(tiempo: TiempoAntiguedad | null | undefined): string {
  if (!tiempo) {
    return SIN_DATO;
  }
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${dos(tiempo.anios)} - ${dos(tiempo.meses)} - ${dos(tiempo.dias)}`;
}

export function aFilaCuadroVista(fila: FilaCuadroAntiguedad): FilaCuadroVista {
  const conSuperior = !!fila.inicioJuezSuperior;
  const periodos = fila.periodosProvisional ?? 0;
  const conProvisional = periodos > 0;

  return {
    clave: fila.idFichaValoracion || fila.idMagistrado || String(fila.orden),
    orden: `${fila.orden}º`,
    apellidosNombres: fila.apellidosNombres,
    fechaNacimiento: formatearFechaCuadro(fila.fechaNacimiento),
    fechaJuramentoTitular: formatearFechaCuadro(fila.fechaJuramentoTitular),
    tiempoTitular: formatearTiempoCuadro(fila.tiempoTitular),
    inicioJuezSuperior: formatearFechaCuadro(fila.inicioJuezSuperior),
    finJuezSuperior: formatearFechaCuadro(fila.finJuezSuperior),
    tiempoJuezSuperior: conSuperior ? formatearTiempoCuadro(fila.tiempoJuezSuperior) : SIN_DATO,
    inicioProvisional: formatearFechaCuadro(fila.inicioProvisional),
    finProvisional: formatearFechaCuadro(fila.finProvisional),
    provisionalEnCurso: conProvisional && !fila.finProvisional,
    periodosProvisional: conProvisional ? String(periodos) : SIN_DATO,
    tiempoProvisional: conProvisional ? formatearTiempoCuadro(fila.tiempoProvisional) : SIN_DATO,
    fechaColegiatura: formatearFechaCuadro(fila.fechaColegiatura),
    aniosColegiatura: fila.aniosColegiatura == null ? SIN_DATO : String(fila.aniosColegiatura),
  };
}
