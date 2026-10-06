import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export interface CatalogosPublicacionJuridica {
  tiposPublicacion: CatalogoItem[];
  paises: CatalogoItem[];
}

export type ListarCatalogosPublicacionJuridicaResultado =
  | { exito: true; catalogos: CatalogosPublicacionJuridica }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ListarCatalogosPublicacionJuridicaUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(): Observable<ListarCatalogosPublicacionJuridicaResultado> {
    return forkJoin({
      tiposPublicacion: this.maestros.listarTiposPublicacion(),
      paises: this.maestros.listarPaises(),
    }).pipe(
      map((catalogos) => ({ exito: true as const, catalogos })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron cargar los catálogos del rubro G.'),
        })
      )
    );
  }
}
