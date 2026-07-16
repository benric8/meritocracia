/**
 * Agregado raíz de la ficha de valoración (RF006).
 * Una ficha = un juez (DNI) + una fecha de valoración (periodo).
 */

export type EstadoFicha = 'BORRADOR' | 'REGISTRADA' | 'CERRADA';

export interface DatosPersonalesJuez {
  dni: string;
  nombreCompleto: string;
  /** Referencia o data URL de la foto SIGA. */
  foto: string;
  fechaNacimiento: string;
  sexo: 'M' | 'F';
  /** Edad calculada vs fechaValoracionSnapshot; la persiste el back. */
  edad: number | null;
}

export interface FichaValoracion {
  id: string;
  estado: EstadoFicha;
  nivelId: string;
  nivelNombre: string;
  fechaValoracionId: string;
  /** Snapshot congelado al crear; base de todos los cálculos. */
  fechaValoracionSnapshot: string;
  datosPersonales: DatosPersonalesJuez;
  /** Trazabilidad del arrastre desde un ciclo anterior. */
  fichaPreviaId: string | null;
  puntajeTotal: number;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearBorradorFicha {
  nivelId: string;
  nivelNombre: string;
  fechaValoracionId: string;
  fechaValoracionSnapshot: string;
  datosPersonales: DatosPersonalesJuez;
  /** Si hay ficha en ciclo pasado, el back arrastra ítems vigentes. */
  arrastrarDesdeFichaId?: string | null;
}

export interface ActualizarDatosPersonalesFicha {
  nivelId: string;
  nivelNombre: string;
  datosPersonales: DatosPersonalesJuez;
}

/**
 * Resultado de resolver si el juez ya tiene ficha en el ciclo vigente.
 * Clave natural: (dni, fechaValoracionId).
 */
export type ResultadoResolverFicha =
  | { tipo: 'NUEVA' }
  | { tipo: 'NUEVA_CON_PREVIA'; fichaPreviaId: string }
  | { tipo: 'EDITABLE'; fichaId: string }
  | { tipo: 'BLOQUEADA'; fichaId: string };
