import { BaseResponse } from './BaseResponse,dto';

/** Respuesta paginada estándar del backend (reutilizable en otros módulos). */
export interface PaginatedResponseDto<T> extends BaseResponse {
  data: T[];
  totalRegistros: number;
  totalPaginas: number;
  paginaActual: number;
  tamanioPagina: number;
}
