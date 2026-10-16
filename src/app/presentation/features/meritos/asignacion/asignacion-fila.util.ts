import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  FichaSuplencia,
  RegistradorSuplente,
  SuplenciaAsignada,
} from '../../../../domain/models/suplencia.model';

/** Valores editables de una fila de la bandeja de suplencias. */
export interface ValoresFilaSuplencia {
  suplenteId: number | null;
  motivo: string | null;
}

export type FormFilaSuplencia = FormGroup<{
  suplenteId: FormControl<number | null>;
  motivo: FormControl<string | null>;
}>;

export type AccionGuardarFila =
  | { tipo: 'ASIGNAR'; suplenteId: number; motivo: string }
  | { tipo: 'RETIRAR' }
  | { tipo: 'NINGUNA' };

export function valoresDesdeFicha(ficha: FichaSuplencia): ValoresFilaSuplencia {
  return {
    suplenteId: ficha.registradorSuplenteId ?? null,
    motivo: ficha.motivo ?? null,
  };
}

/** Opciones de suplente de la fila: todos los registradores excepto el titular. */
export function registradoresParaFila(
  registradores: RegistradorSuplente[],
  registradorTitularId: number
): RegistradorSuplente[] {
  return registradores.filter((registrador) => registrador.id !== registradorTitularId);
}

export function etiquetaRegistrador(registrador: RegistradorSuplente): string {
  return registrador.usuario
    ? `${registrador.usuario} - ${registrador.nombreCompleto}`
    : registrador.nombreCompleto;
}

/**
 * RN-02: con suplente, el motivo se habilita y es obligatorio.
 * RN-04: sin suplente, el motivo se limpia y se deshabilita.
 */
export function aplicarReglaMotivo(form: FormFilaSuplencia): void {
  const motivo = form.controls.motivo;

  if (form.controls.suplenteId.value == null) {
    motivo.clearValidators();
    motivo.setValue(null, { emitEvent: false });
    motivo.disable({ emitEvent: false });
  } else {
    motivo.setValidators(Validators.required);
    motivo.enable({ emitEvent: false });
  }

  motivo.updateValueAndValidity({ emitEvent: false });
  form.updateValueAndValidity();
}

export function crearFormularioFila(valores: ValoresFilaSuplencia): FormFilaSuplencia {
  const form: FormFilaSuplencia = new FormGroup({
    suplenteId: new FormControl<number | null>(valores.suplenteId),
    motivo: new FormControl<string | null>(valores.motivo),
  });
  aplicarReglaMotivo(form);
  return form;
}

/** Vuelve la fila a los valores dados (p. ej. originales tras cancelar o fallar). */
export function restablecerFila(form: FormFilaSuplencia, valores: ValoresFilaSuplencia): void {
  form.enable({ emitEvent: false });
  form.setValue(
    { suplenteId: valores.suplenteId, motivo: valores.motivo },
    { emitEvent: false }
  );
  aplicarReglaMotivo(form);
  form.markAsPristine();
  form.markAsUntouched();
}

export function valoresActuales(form: FormFilaSuplencia): ValoresFilaSuplencia {
  const { suplenteId, motivo } = form.getRawValue();
  return { suplenteId: suplenteId ?? null, motivo: suplenteId == null ? null : motivo ?? null };
}

export function filaCambio(form: FormFilaSuplencia, originales: ValoresFilaSuplencia): boolean {
  const actuales = valoresActuales(form);
  return (
    actuales.suplenteId !== originales.suplenteId || actuales.motivo !== originales.motivo
  );
}

/** Qué llamada corresponde al pulsar Guardar. */
export function resolverAccionGuardar(
  form: FormFilaSuplencia,
  originales: ValoresFilaSuplencia
): AccionGuardarFila {
  if (!filaCambio(form, originales)) {
    return { tipo: 'NINGUNA' };
  }

  const actuales = valoresActuales(form);
  if (actuales.suplenteId == null) {
    return originales.suplenteId != null ? { tipo: 'RETIRAR' } : { tipo: 'NINGUNA' };
  }

  if (!actuales.motivo) {
    return { tipo: 'NINGUNA' };
  }

  return { tipo: 'ASIGNAR', suplenteId: actuales.suplenteId, motivo: actuales.motivo };
}

/** Guardar solo se activa si la fila cambió, es válida y hay algo que enviar. */
export function puedeGuardarFila(
  form: FormFilaSuplencia,
  originales: ValoresFilaSuplencia
): boolean {
  return form.valid && resolverAccionGuardar(form, originales).tipo !== 'NINGUNA';
}

/** Ficha tras asignar: el PUT no trae código/nombre del suplente, se completan de la lista. */
export function fichaConSuplenciaAsignada(
  ficha: FichaSuplencia,
  suplencia: SuplenciaAsignada,
  registradores: RegistradorSuplente[]
): FichaSuplencia {
  const suplente = registradores.find((r) => r.id === suplencia.registradorSuplenteId);
  return {
    ...ficha,
    suplenciaId: suplencia.suplenciaId,
    registradorSuplenteId: suplencia.registradorSuplenteId,
    codigoRegistradorSuplente: suplente?.usuario ?? null,
    nombreRegistradorSuplente: suplente?.nombreCompleto ?? null,
    motivo: suplencia.motivo,
    motivoDescripcion: suplencia.motivoDescripcion,
    fechaInicioSuplencia: suplencia.fechaInicio,
  };
}

export function fichaSinSuplencia(ficha: FichaSuplencia): FichaSuplencia {
  return {
    ...ficha,
    suplenciaId: null,
    registradorSuplenteId: null,
    codigoRegistradorSuplente: null,
    nombreRegistradorSuplente: null,
    motivo: null,
    motivoDescripcion: null,
    fechaInicioSuplencia: null,
  };
}

/** Escapa texto del backend antes de interpolarlo en el HTML de una confirmación. */
export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
