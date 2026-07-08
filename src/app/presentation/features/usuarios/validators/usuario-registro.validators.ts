import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { PERFILES } from '../../../../domain/commons/auth-mappers';

export const USUARIO_REGISTRO = {
  nombreCompleto: {
    minLength: 3,
    maxLength: 150,
  },
  codigo: {
    minLength: 3,
    maxLength: 25,
    pattern: /^[A-Za-z0-9._-]+$/,
  },
  cargo: {
    maxLength: 100,
  },
  dependencia: {
    maxLength: 150,
  },
} as const;

export type CampoUsuarioRegistro =
  | 'nombreCompleto'
  | 'codigo'
  | 'funcion'
  | 'cargo'
  | 'dependencia';

export const OPCIONES_FUNCION_USUARIO = [
  { valor: PERFILES.ADMIN, etiqueta: PERFILES.ADMIN },
  { valor: PERFILES.REGISTRADOR, etiqueta: PERFILES.REGISTRADOR },
] as const;

export const VALIDADORES_NOMBRE_COMPLETO: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(USUARIO_REGISTRO.nombreCompleto.minLength),
  Validators.maxLength(USUARIO_REGISTRO.nombreCompleto.maxLength),
];

export const VALIDADORES_CODIGO_USUARIO: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(USUARIO_REGISTRO.codigo.minLength),
  Validators.maxLength(USUARIO_REGISTRO.codigo.maxLength),
  Validators.pattern(USUARIO_REGISTRO.codigo.pattern),
];

export const VALIDADORES_FUNCION: ValidatorFn[] = [Validators.required];

export const VALIDADORES_CARGO: ValidatorFn[] = [
  Validators.required,
  Validators.maxLength(USUARIO_REGISTRO.cargo.maxLength),
];

export const VALIDADORES_DEPENDENCIA: ValidatorFn[] = [
  Validators.required,
  Validators.maxLength(USUARIO_REGISTRO.dependencia.maxLength),
];

export function mensajeErrorCampoUsuarioRegistro(
  control: AbstractControl,
  campo: CampoUsuarioRegistro
): string | null {
  if (!control.touched || !control.errors) {
    return null;
  }

  if (control.hasError('required')) {
    const mensajes: Record<CampoUsuarioRegistro, string> = {
      nombreCompleto: 'Los nombres y apellidos son obligatorios.',
      codigo: 'El código de usuario es obligatorio.',
      funcion: 'Debe seleccionar una función.',
      cargo: 'El cargo es obligatorio.',
      dependencia: 'La dependencia es obligatoria.',
    };
    return mensajes[campo];
  }

  if (control.hasError('minlength')) {
    const minimo = control.getError('minlength')?.requiredLength as number;
    if (campo === 'nombreCompleto') {
      return `El nombre debe tener al menos ${minimo} caracteres.`;
    }
    if (campo === 'codigo') {
      return `El código debe tener al menos ${minimo} caracteres.`;
    }
  }

  if (control.hasError('maxlength')) {
    const maximo = control.getError('maxlength')?.requiredLength as number;
    const mensajes: Partial<Record<CampoUsuarioRegistro, string>> = {
      nombreCompleto: `El nombre no puede superar ${maximo} caracteres.`,
      codigo: `El código no puede superar ${maximo} caracteres.`,
      cargo: `El cargo no puede superar ${maximo} caracteres.`,
      dependencia: `La dependencia no puede superar ${maximo} caracteres.`,
    };
    return mensajes[campo] ?? null;
  }

  if (control.hasError('pattern') && campo === 'codigo') {
    return 'El código solo puede contener letras, números, punto, guion y guion bajo.';
  }

  return null;
}
