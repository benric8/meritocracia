import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { NivelOfimaticaCatalogo } from '../../../domain/models/rubro-ofimatica.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export interface CatalogosOfimatica {
  niveles: NivelOfimaticaCatalogo[];
  tiposDocumento: CatalogoItem[];
  paises: CatalogoItem[];
}

export type ListarCatalogosOfimaticaResultado =
  | { exito: true; catalogos: CatalogosOfimatica }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ListarCatalogosOfimaticaUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(): Observable<ListarCatalogosOfimaticaResultado> {
    return forkJoin({
      niveles: this.maestros.listarNivelesOfimatica(),
      tiposDocumento: this.maestros.listarTiposDocumentoDistincion(),
      paises: this.maestros.listarPaises(),
    }).pipe(
      map((catalogos) => ({ exito: true as const, catalogos })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron cargar los catálogos de ofimática.'),
        })
      )
    );
  }
}
