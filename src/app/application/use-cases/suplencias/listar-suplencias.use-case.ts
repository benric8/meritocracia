import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PeticionPaginada, ResultadoPaginado } from '../../../domain/models/paginacion.model';
import { FichaSuplencia, FiltrosSuplencias } from '../../../domain/models/suplencia.model';
import { SUPLENCIAS_PORT } from '../../../domain/ports/suplencias.port';

@Injectable({ providedIn: 'root' })
export class ListarSuplenciasUseCase {
  private readonly suplencias = inject(SUPLENCIAS_PORT);

  ejecutar(
    filtros: FiltrosSuplencias,
    paginacion: PeticionPaginada
  ): Observable<ResultadoPaginado<FichaSuplencia>> {
    return this.suplencias.listar(filtros, paginacion);
  }
}
