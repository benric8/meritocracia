import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { FichaResumen, FiltrosConsultaFichas } from '../models/ficha-consulta.model';
import { PeticionPaginada, ResultadoPaginado } from '../models/paginacion.model';

/**
 * Puerto de salida: bandeja de consulta de fichas de valoración (RF006 - Consulta).
 * `listar` se limita siempre a las fichas del registrador en sesión.
 */
export interface FichasConsultaPort {
  listar(
    filtros: FiltrosConsultaFichas,
    paginacion: PeticionPaginada
  ): Observable<ResultadoPaginado<FichaResumen>>;

  /** Búsqueda de todas las fichas, sin limitar al registrador (Reportes - Anexo 04). */
  buscarTodas(
    filtros: FiltrosConsultaFichas,
    paginacion: PeticionPaginada
  ): Observable<ResultadoPaginado<FichaResumen>>;

  cambiarEstado(fichaId: string, activa: boolean): Observable<void>;
}

export const FICHAS_CONSULTA_PORT = new InjectionToken<FichasConsultaPort>(
  'FICHAS_CONSULTA_PORT'
);
