import { Validators } from '@angular/forms';

export const DNI_LENGTH = 8;

export const OPCIONES_SEXO = [
  { valor: 'M', etiqueta: 'Masculino' },
  { valor: 'F', etiqueta: 'Femenino' },
] as const;

export const VALIDADORES_DNI = [
  Validators.required,
  Validators.pattern(/^\d{8}$/),
];

export const VALIDADORES_NIVEL = [Validators.required];

export const VALIDADORES_NOMBRE_COMPLETO = [
  Validators.required,
  Validators.maxLength(200),
];

export const VALIDADORES_FECHA_NACIMIENTO = [Validators.required];

export const VALIDADORES_SEXO = [Validators.required];

export function mensajeErrorCampoDatosPersonales(
  control: { errors: Record<string, unknown> | null; touched: boolean },
  campo: 'dni' | 'nivelId' | 'nombreCompleto' | 'fechaNacimiento' | 'sexo'
): string | null {
  if (!control.touched || !control.errors) {
    return null;
  }

  if (control.errors['required']) {
    switch (campo) {
      case 'dni':
        return 'Ingrese el DNI del juez.';
      case 'nivelId':
        return 'Seleccione el nivel.';
      case 'nombreCompleto':
        return 'Ingrese apellidos y nombres.';
      case 'fechaNacimiento':
        return 'Seleccione la fecha de nacimiento.';
      case 'sexo':
        return 'Seleccione el sexo.';
    }
  }

  if (control.errors['matDatepickerParse'] && campo === 'fechaNacimiento') {
    return 'Fecha de nacimiento inválida.';
  }

  if (control.errors['matDatepickerMax'] && campo === 'fechaNacimiento') {
    return 'La fecha de nacimiento no puede ser futura.';
  }

  if (control.errors['pattern'] && campo === 'dni') {
    return `El DNI debe tener ${DNI_LENGTH} dígitos.`;
  }

  if (control.errors['maxlength'] && campo === 'nombreCompleto') {
    return 'Máximo 200 caracteres.';
  }

  return null;
}

export function soloDigitosDni(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, DNI_LENGTH);
}

/** Convierte `Date` local a ISO `YYYY-MM-DD` sin desfase UTC. */
export function aFechaIsoLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}
