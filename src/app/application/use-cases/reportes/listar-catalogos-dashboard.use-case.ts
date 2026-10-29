import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export interface CatalogosDashboard {
  distritosJudiciales: CatalogoItem[];
  especialidades: CatalogoItem[];
}

export type ListarCatalogosDashboardResultado =
  | { exito: true; catalogos: CatalogosDashboard }
  | { exito: false; detalle: DetalleError };

/** Catálogos de los filtros globales del dashboard de rubros. */
@Injectable({ providedIn: 'root' })
export class ListarCatalogosDashboardUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(): Observable<ListarCatalogosDashboardResultado> {
    return forkJoin({
      distritosJudiciales: this.maestros.listarDistritosJudiciales(),
      especialidades: this.maestros.listarEspecialidades(),
    }).pipe(
      map((catalogos) => ({ exito: true as const, catalogos })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron cargar los filtros del dashboard.'),
        })
      )
    );
  }
}
