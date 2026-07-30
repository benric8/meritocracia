import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export type BuscarInstitucionesIdiomaResultado =
  | { exito: true; instituciones: CatalogoItem[] }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class BuscarInstitucionesIdiomaUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(termino: string): Observable<BuscarInstitucionesIdiomaResultado> {
    return this.maestros.buscarInstitucionesIdioma(termino).pipe(
      map((instituciones) => ({ exito: true as const, instituciones })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron buscar instituciones.'),
        })
      )
    );
  }
}
