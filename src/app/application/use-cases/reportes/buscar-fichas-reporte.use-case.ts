import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FichaResumen, FiltrosConsultaFichas } from '../../../domain/models/ficha-consulta.model';
import { PeticionPaginada, ResultadoPaginado } from '../../../domain/models/paginacion.model';
import { FICHAS_CONSULTA_PORT } from '../../../domain/ports/fichas-consulta.port';

/** Anexo 04: busca la ficha de cualquier juez (sin limitar al registrador en sesión). */
@Injectable({ providedIn: 'root' })
export class BuscarFichasReporteUseCase {
  private readonly fichas = inject(FICHAS_CONSULTA_PORT);

  ejecutar(
    filtros: FiltrosConsultaFichas,
    paginacion: PeticionPaginada
  ): Observable<ResultadoPaginado<FichaResumen>> {
    return this.fichas.buscarTodas(filtros, paginacion);
  }
}
