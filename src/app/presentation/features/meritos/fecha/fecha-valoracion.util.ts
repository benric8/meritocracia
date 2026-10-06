import { Validators } from '@angular/forms';

export const RESOLUCION_MAX_LENGTH = 120;

export const VALIDADORES_FECHA_VALORACION = [Validators.required];

export const VALIDADORES_RESOLUCION = [
  Validators.required,
  Validators.maxLength(RESOLUCION_MAX_LENGTH),
];

export function mensajeErrorCampoFechaValoracion(
  control: { errors: Record<string, unknown> | null; touched: boolean },
  campo: 'fechaValoracion' | 'resolucion'
): string | null {
  if (!control.touched || !control.errors) {
    return null;
  }

  if (control.errors['required']) {
    return campo === 'fechaValoracion'
      ? 'Seleccione una fecha de valoración.'
      : 'Ingrese la resolución que aprueba la fecha.';
  }

  if (control.errors['maxlength']) {
    return `Máximo ${RESOLUCION_MAX_LENGTH} caracteres.`;
  }

  return null;
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

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatearFechaHora(iso: string): string {
  if (!iso) {
    return '';
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function fechaHoyIso(): string {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}
