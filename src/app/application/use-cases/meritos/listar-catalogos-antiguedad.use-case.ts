import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export interface CatalogosAntiguedad {
  distritosJudiciales: CatalogoItem[];
  cargosTitular: CatalogoItem[];
  cargosProvisional: CatalogoItem[];
  especialidades: CatalogoItem[];
  nivelesInmediatosAnteriores: CatalogoItem[];
  colegiosAbogados: CatalogoItem[];
}

export type ListarCatalogosAntiguedadResultado =
  | { exito: true; catalogos: CatalogosAntiguedad }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ListarCatalogosAntiguedadUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  /**
   * @param cargoMagistradoId ID del cargo evaluado de la ficha (cabecera).
   *   Requerido para cargo titular, provisionalidad e inmediato anterior.
   */
  ejecutar(cargoMagistradoId: string): Observable<ListarCatalogosAntiguedadResultado> {
    const cargoId = cargoMagistradoId?.trim() ?? '';

    return forkJoin({
      distritosJudiciales: this.maestros.listarDistritosJudiciales(),
      cargosTitular: this.maestros.listarCargosTitular(cargoId),
      cargosProvisional: this.maestros.listarCargosProvisional(cargoId),
      especialidades: this.maestros.listarEspecialidades(),
      nivelesInmediatosAnteriores: this.maestros.listarNivelesInmediatosAnteriores(cargoId),
      colegiosAbogados: this.maestros.listarColegiosAbogados(),
    }).pipe(
      map((catalogos) => ({ exito: true as const, catalogos })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(
            error,
            'No se pudieron cargar los catálogos de antigüedad.'
          ),
        })
      )
    );
  }
}
