import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { TipoCursoEspecializacionCatalogo } from '../../../domain/models/rubro-cursos-especializacion.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export interface CatalogosCursosEspecializacion {
  tipos: TipoCursoEspecializacionCatalogo[];
  paises: CatalogoItem[];
  especialidades: CatalogoItem[];
}

export type ListarCatalogosCursosEspecializacionResultado =
  | { exito: true; catalogos: CatalogosCursosEspecializacion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ListarCatalogosCursosEspecializacionUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(): Observable<ListarCatalogosCursosEspecializacionResultado> {
    return forkJoin({
      tipos: this.maestros.listarTiposCursoEspecializacion(),
      paises: this.maestros.listarPaises(),
      especialidades: this.maestros.listarEspecialidades(),
    }).pipe(
      map((catalogos) => ({ exito: true as const, catalogos })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(
            error,
            'No se pudieron cargar los catálogos de cursos de especialización.'
          ),
        })
      )
    );
  }
}
