/** Fila de la bandeja de consulta de fichas de valoración (RF006 - Consulta). */
export interface FichaResumen {
  id: string;
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  /** ISO `yyyy-MM-dd`. */
  fechaValoracion: string;
  completada: boolean;
  /** Una ficha inactiva no se puede editar. */
  activa: boolean;
}

/** Filtros de la bandeja; los vacíos no se envían al API. */
export interface FiltrosConsultaFichas {
  dni: string;
  apellidos: string;
  nombres: string;
}

export const FILTROS_CONSULTA_FICHAS_VACIOS: FiltrosConsultaFichas = {
  dni: '',
  apellidos: '',
  nombres: '',
};
