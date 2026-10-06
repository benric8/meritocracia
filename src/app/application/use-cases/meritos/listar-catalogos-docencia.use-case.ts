import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export interface CatalogosDocencia {
  especialidades: CatalogoItem[];
}

export type ListarCatalogosDocenciaResultado =
  | { exito: true; catalogos: CatalogosDocencia }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ListarCatalogosDocenciaUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(): Observable<ListarCatalogosDocenciaResultado> {
    return this.maestros.listarEspecialidades().pipe(
      map((especialidades) => ({
        exito: true as const,
        catalogos: { especialidades },
      })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron cargar los catálogos del rubro I.'),
        })
      )
    );
  }
}
