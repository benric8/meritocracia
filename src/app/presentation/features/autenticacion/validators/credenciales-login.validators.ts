import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';

/** Límites y formato de credenciales en el formulario de login (validación de UI). */
export const CREDENCIALES_LOGIN = {
  usuario: {
    minLength: 8,
    maxLength: 25,
    /** Letras (con tildes), números, punto, guion y guion bajo. */
    pattern: /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9._-]+$/,
  },
  clave: {
    minLength: 6,
    maxLength: 100,
  },
} as const;

export type CampoCredencialesLogin = 'usuario' | 'clave';

export const VALIDADORES_USUARIO_LOGIN: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(CREDENCIALES_LOGIN.usuario.minLength),
  Validators.maxLength(CREDENCIALES_LOGIN.usuario.maxLength),
  Validators.pattern(CREDENCIALES_LOGIN.usuario.pattern),
];

export const VALIDADORES_CLAVE_LOGIN: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(CREDENCIALES_LOGIN.clave.minLength),
  Validators.maxLength(CREDENCIALES_LOGIN.clave.maxLength),
];

export function mensajeErrorCampoLogin(
  control: AbstractControl,
  campo: CampoCredencialesLogin
): string | null {
  if (!control.touched || !control.errors) {
    return null;
  }

  const { usuario, clave } = CREDENCIALES_LOGIN;

  if (control.hasError('required')) {
    return campo === 'usuario' ? 'El usuario es obligatorio.' : 'La contraseña es obligatoria.';
  }

  if (control.hasError('minlength')) {
    const minimo = control.getError('minlength')?.requiredLength as number;
    return campo === 'usuario'
      ? `El usuario debe tener al menos ${minimo} caracteres.`
      : `La contraseña debe tener al menos ${minimo} caracteres.`;
  }

  if (control.hasError('maxlength')) {
    const maximo = control.getError('maxlength')?.requiredLength as number;
    return campo === 'usuario'
      ? `El usuario no puede superar ${maximo} caracteres.`
      : `La contraseña no puede superar ${maximo} caracteres.`;
  }

  if (control.hasError('pattern') && campo === 'usuario') {
    return 'El usuario solo puede contener letras, números, punto, guion y guion bajo.';
  }

  return null;
}
