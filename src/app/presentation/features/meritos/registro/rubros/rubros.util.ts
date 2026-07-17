/** Convierte `Date` local a ISO `YYYY-MM-DD` sin desfase UTC. */
export function aFechaIsoLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** Convierte ISO `YYYY-MM-DD` a `Date` local. */
export function aDateDesdeIso(iso: string | null | undefined): Date | null {
  if (!iso) {
    return null;
  }
  const solo = iso.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(solo)) {
    return null;
  }
  const [anio, mes, dia] = solo.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

export function inicioDelDia(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

/** `true` si `candidata` es estrictamente anterior a `referencia` (solo día). */
export function esFechaAnterior(candidata: Date, referencia: Date): boolean {
  return inicioDelDia(candidata).getTime() < inicioDelDia(referencia).getTime();
}

/**
 * Filtro de datepicker: no permite fechas anteriores a `minima`.
 * Si no hay mínima, permite cualquier fecha.
 */
export function crearFiltroFechaMinima(
  obtenerMinima: () => Date | null
): (fecha: Date | null) => boolean {
  return (fecha: Date | null): boolean => {
    if (!fecha) {
      return false;
    }
    const minima = obtenerMinima();
    if (!minima) {
      return true;
    }
    return !esFechaAnterior(fecha, minima);
  };
}

/**
 * Filtro de datepicker: no permite fechas posteriores a `maxima`.
 * Si no hay máxima, permite cualquier fecha.
 */
export function crearFiltroFechaMaxima(
  obtenerMaxima: () => Date | null
): (fecha: Date | null) => boolean {
  return (fecha: Date | null): boolean => {
    if (!fecha) {
      return false;
    }
    const maxima = obtenerMaxima();
    if (!maxima) {
      return true;
    }
    return !esFechaAnterior(maxima, fecha);
  };
}

/** Limpia `fechaFin` si quedó anterior a `fechaInicio`. */
export function corregirFechaFinSiAnteriorAInicio(
  fechaInicio: Date | null,
  fechaFin: Date | null
): Date | null {
  if (!fechaInicio || !fechaFin) {
    return fechaFin;
  }
  return esFechaAnterior(fechaFin, fechaInicio) ? null : fechaFin;
}

export function formatearPuntaje(puntaje: number): string {
  return puntaje.toFixed(2);
}

/** Evita desfase de día por UTC en fechas `YYYY-MM-DD`. */
export function formatearFechaCorta(iso: string): string {
  if (!iso) {
    return '';
  }
  const soloFecha = iso.slice(0, 10);
  const partes = soloFecha.split('-');
  if (partes.length === 3) {
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
  }
  return iso;
}

export function nuevoIdLocal(prefijo: string): string {
  return `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
