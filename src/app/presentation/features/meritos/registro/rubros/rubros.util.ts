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
