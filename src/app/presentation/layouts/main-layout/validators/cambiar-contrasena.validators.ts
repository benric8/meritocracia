import {
  AbstractControl,
  FormControl,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { LIMITES_CLAVE } from '../../../../domain/commons/credenciales.constants';

export const CAMBIAR_CONTRASENA = {
  campos: {
    claveActual: 'claveActual',
    nuevaClave: 'nuevaClave',
    confirmarClave: 'confirmarClave',
  },

  clave: LIMITES_CLAVE,
  errores: {
    clavesNoCoinciden: 'clavesNoCoinciden',
  },
} as const;

export type CampoCambiarContrasena =
  (typeof CAMBIAR_CONTRASENA.campos)[keyof typeof CAMBIAR_CONTRASENA.campos];

export const TEXTOS_CAMBIAR_CONTRASENA = {
  titulo: 'Cambiar contraseña',
  ariaCerrar: 'Cerrar formulario de cambio de contraseña',
  labels: {
    claveActual: 'Contraseña actual',
    nuevaClave: 'Nueva contraseña',
    confirmarClave: 'Confirmar nueva contraseña',
  },
  ariaMostrar: {
    claveActual: 'Mostrar contraseña actual',
    nuevaClave: 'Mostrar nueva contraseña',
    confirmarClave: 'Mostrar confirmación',
  },
  ariaOcultar: {
    claveActual: 'Ocultar contraseña actual',
    nuevaClave: 'Ocultar nueva contraseña',
    confirmarClave: 'Ocultar confirmación',
  },
  acciones: {
    limpiar: 'Limpiar',
    guardar: 'Cambiar',
    guardando: 'Guardando...',
  },
  feedback: {
    errorTitulo: 'No se pudo cambiar',
    errorPorDefecto: 'No se pudo cambiar la contraseña.',
    exitoTitulo: 'Contraseña actualizada',
    exitoTexto: 'Su contraseña se cambió correctamente. Debe iniciar sesión nuevamente.',
  },
  validacion: {
    obligatorio: {
      claveActual: 'La contraseña actual es obligatoria.',
      nuevaClave: 'La nueva contraseña es obligatoria.',
      confirmarClave: 'La confirmación de contraseña es obligatoria.',
    } satisfies Record<CampoCambiarContrasena, string>,
    minLength: (minimo: number) => `La contraseña debe tener al menos ${minimo} caracteres.`,
    maxLength: (maximo: number) => `La contraseña no puede superar ${maximo} caracteres.`,
    clavesNoCoinciden: 'Las contraseñas nuevas no coinciden.',
  },
} as const;

export const VALIDADORES_CLAVE_CAMBIO: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(CAMBIAR_CONTRASENA.clave.minLength),
  Validators.maxLength(CAMBIAR_CONTRASENA.clave.maxLength),
];

/**
 * Valida que dos controles del grupo tengan el mismo valor.
 * Por defecto compara nueva clave vs confirmación.
 */
export function validadorClavesCoinciden(
  campoClave: CampoCambiarContrasena = CAMBIAR_CONTRASENA.campos.nuevaClave,
  campoConfirmacion: CampoCambiarContrasena = CAMBIAR_CONTRASENA.campos.confirmarClave
): ValidatorFn {
  const errorKey = CAMBIAR_CONTRASENA.errores.clavesNoCoinciden;

  return (group: AbstractControl): ValidationErrors | null => {
    const clave = group.get(campoClave)?.value as string | undefined;
    const confirmacion = group.get(campoConfirmacion)?.value as string | undefined;

    if (!clave || !confirmacion) {
      return null;
    }

    return clave === confirmacion ? null : { [errorKey]: true };
  };
}

/** Marca error en confirmación también cuando falla el validador de grupo. */
export class ConfirmacionClaveErrorStateMatcher implements ErrorStateMatcher {
  constructor(
    private readonly errorGrupo: string = CAMBIAR_CONTRASENA.errores.clavesNoCoinciden
  ) {}

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const tocado = !!(control && (control.dirty || control.touched));
    return tocado && !!(control?.invalid || form?.hasError(this.errorGrupo));
  }
}

export function mensajeErrorCampoCambiarContrasena(
  control: AbstractControl,
  campo: CampoCambiarContrasena,
  erroresGrupo: ValidationErrors | null = null
): string | null {
  if (!control.touched) {
    return null;
  }

  const { validacion } = TEXTOS_CAMBIAR_CONTRASENA;

  if (control.hasError('required')) {
    return validacion.obligatorio[campo];
  }

  if (control.hasError('minlength')) {
    const minimo =
      (control.getError('minlength')?.requiredLength as number | undefined) ??
      CAMBIAR_CONTRASENA.clave.minLength;
    return validacion.minLength(minimo);
  }

  if (control.hasError('maxlength')) {
    const maximo =
      (control.getError('maxlength')?.requiredLength as number | undefined) ??
      CAMBIAR_CONTRASENA.clave.maxLength;
    return validacion.maxLength(maximo);
  }

  if (
    campo === CAMBIAR_CONTRASENA.campos.confirmarClave &&
    erroresGrupo?.[CAMBIAR_CONTRASENA.errores.clavesNoCoinciden]
  ) {
    return validacion.clavesNoCoinciden;
  }

  return null;
}
