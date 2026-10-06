import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { TipoPasantiaCatalogo } from '../../../domain/models/rubro-pasantias.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export interface CatalogosPasantias {
  tipos: TipoPasantiaCatalogo[];
  paises: CatalogoItem[];
  especialidades: CatalogoItem[];
}

export type ListarCatalogosPasantiasResultado =
  | { exito: true; catalogos: CatalogosPasantias }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ListarCatalogosPasantiasUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(): Observable<ListarCatalogosPasantiasResultado> {
    return forkJoin({
      tipos: this.maestros.listarTiposPasantia(),
      paises: this.maestros.listarPaises(),
      especialidades: this.maestros.listarEspecialidades(),
    }).pipe(
      map((catalogos) => ({ exito: true as const, catalogos })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron cargar los catálogos de pasantías.'),
        })
      )
    );
  }
}
