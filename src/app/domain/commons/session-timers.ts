/** Margen de seguridad antes del vencimiento del token activo (segundos). */
export const MARGEN_TOKEN_SEG = 5;

/** Intervalo del monitoreo de sesión en segundo plano (milisegundos). */
export const INTERVALO_MONITOREO_MS = 15_000;

/** Intervalo de actualización del contador en el aviso de renovación (milisegundos). */
export const INTERVALO_CONTADOR_AVISO_MS = 1_000;

export function segundosTranscurridos(desdeEpochMs: number | null, ahoraMs = Date.now()): number {
  if (desdeEpochMs == null || !Number.isFinite(desdeEpochMs)) {
    return -1;
  }
  return Math.floor((ahoraMs - desdeEpochMs) / 1000);
}

export function tokenVigente(
  transcurrido: number,
  exps: number,
  margenSeg = MARGEN_TOKEN_SEG
): boolean {
  if (transcurrido < 0 || exps < 0) {
    return false;
  }
  return transcurrido < exps - margenSeg;
}

export function ventanaRefreshVigente(transcurrido: number, exps: number, refs: number): boolean {
  if (transcurrido < 0 || exps < 0 || refs < 0) {
    return false;
  }
  return transcurrido < exps + refs;
}

export function enVentanaRenovacion(transcurrido: number, exps: number, refs: number): boolean {
  return ventanaRefreshVigente(transcurrido, exps, refs) && !tokenVigente(transcurrido, exps);
}

export function segundosRestantesRefresh(transcurrido: number, exps: number, refs: number): number {
  return Math.max(0, exps + refs - transcurrido);
}

export function formatearDuracion(segundos: number): string {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const resto = segundos % 60;

  if (horas > 0) {
    return `${horas} h ${minutos} min ${resto} s`;
  }
  if (minutos > 0) {
    return `${minutos} min ${resto} s`;
  }
  return `${resto} segundos`;
}
