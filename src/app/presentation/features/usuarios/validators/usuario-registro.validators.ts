import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { PERFILES } from '../../../../domain/commons/auth-mappers';

export const USUARIO_REGISTRO = {
  nombreCompleto: {
    minLength: 8,
    maxLength: 150,
    /** Nombre(s) y al menos dos apellidos, p. ej. «Juan Pérez García». */
    minPalabras: 3,
    minLongitudPalabra: 2,
    /** Solo letras (con tildes) y espacios simples entre palabras. */
    pattern: /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/,
  },
  codigo: {
    minLength: 3,
    maxLength: 25,
    pattern: /^[A-Za-z]+$/,
  },
  cargo: {
    maxLength: 100,
  },
  dependencia: {
    maxLength: 100,
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

export function validadorNombreCompletoUsuario(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = (control.value as string)?.trim() ?? '';
    if (!valor) {
      return null;
    }

    const palabras = valor.split(/\s+/).filter(Boolean);
    const { minPalabras, minLongitudPalabra } = USUARIO_REGISTRO.nombreCompleto;

    if (palabras.length < minPalabras) {
      return {
        nombreIncompleto: {
          minPalabras,
          actual: palabras.length,
        },
      };
    }

    if (palabras.some((palabra) => palabra.length < minLongitudPalabra)) {
      return { palabraMuyCorta: { minLongitudPalabra } };
    }

    return null;
  };
}

export const VALIDADORES_NOMBRE_COMPLETO: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(USUARIO_REGISTRO.nombreCompleto.minLength),
  Validators.maxLength(USUARIO_REGISTRO.nombreCompleto.maxLength),
  Validators.pattern(USUARIO_REGISTRO.nombreCompleto.pattern),
  validadorNombreCompletoUsuario(),
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

  if (campo === 'nombreCompleto' && control.hasError('nombreIncompleto')) {
    return 'Ingrese nombres y al menos dos apellidos.';
  }

  if (campo === 'nombreCompleto' && control.hasError('palabraMuyCorta')) {
    const minimo = control.getError('palabraMuyCorta')?.minLongitudPalabra as number;
    return `Cada nombre o apellido debe tener al menos ${minimo} caracteres.`;
  }

  if (control.hasError('minlength')) {
    const minimo = control.getError('minlength')?.requiredLength as number;
    if (campo === 'nombreCompleto') {
      return `El nombre completo debe tener al menos ${minimo} caracteres.`;
    }
    if (campo === 'codigo') {
      return `El código debe tener al menos ${minimo} caracteres.`;
    }
  }

  if (control.hasError('maxlength')) {
    const maximo = control.getError('maxlength')?.requiredLength as number;
    const mensajes: Partial<Record<CampoUsuarioRegistro, string>> = {
      nombreCompleto: `El nombre completo no puede superar ${maximo} caracteres.`,
      codigo: `El código no puede superar ${maximo} caracteres.`,
      cargo: `El cargo no puede superar ${maximo} caracteres.`,
      dependencia: `La dependencia no puede superar ${maximo} caracteres.`,
    };
    return mensajes[campo] ?? null;
  }

  if (control.hasError('pattern')) {
    if (campo === 'nombreCompleto') {
      return 'Solo se permiten letras y espacios entre palabras.';
    }
    if (campo === 'codigo') {
      return 'Solo se permiten letras, números, punto, guion y guion bajo.';
    }
  }

  return null;
}
