import { PaginatedResponseDto } from './PaginatedResponse.dto';

/** Fila de `GET fichas` (bandeja de consulta). */
export interface FichaResumenDto {
  idFicha: number;
  dni: string | number;
  nombres: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  nombreCompleto: string | null;
  fechaValoracion: string | null;
  completado: '0' | '1' | null;
  activo: '0' | '1' | null;
}

export type ListarFichasResumenResponse = PaginatedResponseDto<FichaResumenDto>;

/** Body de `PATCH fichas/{id}/estado`. */
export interface CambiarEstadoFichaRequest {
  activo: '0' | '1';
}
