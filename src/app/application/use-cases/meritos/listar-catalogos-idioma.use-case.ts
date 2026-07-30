import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { IdiomaCatalogoItem } from '../../../domain/models/rubro-idioma.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export interface CatalogosIdioma {
  idiomas: IdiomaCatalogoItem[];
  nivelesIdioma: CatalogoItem[];
  tiposDocumento: CatalogoItem[];
  paises: CatalogoItem[];
}

export type ListarCatalogosIdiomaResultado =
  | { exito: true; catalogos: CatalogosIdioma }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ListarCatalogosIdiomaUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(): Observable<ListarCatalogosIdiomaResultado> {
    return forkJoin({
      idiomas: this.maestros.listarIdiomas(),
      nivelesIdioma: this.maestros.listarNivelesIdioma(),
      tiposDocumento: this.maestros.listarTiposDocumentoIdioma(),
      paises: this.maestros.listarPaises(),
    }).pipe(
      map((catalogos) => ({ exito: true as const, catalogos })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron cargar los catálogos del rubro F.'),
        })
      )
    );
  }
}
