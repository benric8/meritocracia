/** Registrador elegible como titular/suplente (perfil registrador activo). */
export interface RegistradorSuplente {
  id: number;
  usuario: string;
  nombreCompleto: string;
}

/** Motivo de suplencia: se muestra `descripcion` y se envía `codigo`. */
export interface MotivoSuplencia {
  codigo: string;
  descripcion: string;
}

/**
 * Fila de la bandeja de suplencias. Los datos del suplente son `null`
 * cuando la ficha no tiene suplencia vigente.
 */
export interface FichaSuplencia {
  fichaId: string;
  fechaValoracion: string;
  registradorTitularId: number;
  codigoRegistradorTitular: string;
  nombreRegistradorTitular: string;
  dniMagistrado: string;
  nombreMagistrado: string;
  suplenciaId: string | null;
  registradorSuplenteId: number | null;
  codigoRegistradorSuplente: string | null;
  nombreRegistradorSuplente: string | null;
  motivo: string | null;
  motivoDescripcion: string | null;
  fechaInicioSuplencia: string | null;
}

/** Filtros de la bandeja; `null`/vacío = no filtrar. */
export interface FiltrosSuplencias {
  registradorTitularId: number | null;
  dni: string;
  /** `true` solo con suplente, `false` solo sin suplente, `null` todas. */
  conSuplente: boolean | null;
}

export const FILTROS_SUPLENCIAS_VACIOS: FiltrosSuplencias = {
  registradorTitularId: null,
  dni: '',
  conSuplente: null,
};

/** Respuesta de asignar suplencia (no incluye código ni nombre del suplente). */
export interface SuplenciaAsignada {
  suplenciaId: string;
  fichaId: string;
  registradorSuplenteId: number;
  motivo: string;
  motivoDescripcion: string;
  fechaInicio: string | null;
}
