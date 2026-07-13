export type EstadoFechaValoracion = 'VIGENTE' | 'INACTIVO';

export interface FechaValoracion {
  id: string;
  fechaValoracion: string;
  anio: number;
  resolucion: string;
  estado: EstadoFechaValoracion;
  usuarioRegistro: string;
  fechaRegistro: string;
}

export interface NuevaFechaValoracion {
  fechaValoracion: string;
  resolucion: string;
}
