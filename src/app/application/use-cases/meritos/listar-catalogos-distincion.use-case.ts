import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { TipoDistincionCatalogoItem } from '../../../domain/models/rubro-distincion.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export interface CatalogosDistincion {
  tiposDistincion: TipoDistincionCatalogoItem[];
  tiposDocumento: CatalogoItem[];
  paises: CatalogoItem[];
}

export type ListarCatalogosDistincionResultado =
  | { exito: true; catalogos: CatalogosDistincion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ListarCatalogosDistincionUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(): Observable<ListarCatalogosDistincionResultado> {
    return forkJoin({
      tiposDistincion: this.maestros.listarTiposDistincion(),
      tiposDocumento: this.maestros.listarTiposDocumentoDistincion(),
      paises: this.maestros.listarPaises(),
    }).pipe(
      map((catalogos) => ({ exito: true as const, catalogos })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron cargar los catálogos del rubro H.'),
        })
      )
    );
  }
}
