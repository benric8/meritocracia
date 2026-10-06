/** Parámetros de consulta paginada enviados al API (`?pagina=&tamanio=`). */
export interface PeticionPaginada {
  pagina: number;
  tamanio: number;
}

export const PAGINACION_POR_DEFECTO: PeticionPaginada = {
  pagina: 1,
  tamanio: 5,
};

/** Resultado de dominio para listados paginados. */
export interface ResultadoPaginado<T> {
  elementos: T[];
  totalRegistros: number;
  totalPaginas: number;
  paginaActual: number;
  tamanioPagina: number;
}
