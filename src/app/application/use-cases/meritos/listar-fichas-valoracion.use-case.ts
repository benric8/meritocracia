import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FichaResumen, FiltrosConsultaFichas } from '../../../domain/models/ficha-consulta.model';
import { PeticionPaginada, ResultadoPaginado } from '../../../domain/models/paginacion.model';
import { FICHAS_CONSULTA_PORT } from '../../../domain/ports/fichas-consulta.port';

/** Bandeja de consulta: fichas del registrador en sesión, filtradas y paginadas. */
@Injectable({ providedIn: 'root' })
export class ListarFichasValoracionUseCase {
  private readonly fichas = inject(FICHAS_CONSULTA_PORT);

  ejecutar(
    filtros: FiltrosConsultaFichas,
    paginacion: PeticionPaginada
  ): Observable<ResultadoPaginado<FichaResumen>> {
    return this.fichas.listar(filtros, paginacion);
  }
}
