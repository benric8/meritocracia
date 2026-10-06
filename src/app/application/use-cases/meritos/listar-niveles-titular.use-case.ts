import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { NivelTitular } from '../../../domain/models/nivel-titular.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export type ListarNivelesTitularResultado =
  | { exito: true; niveles: NivelTitular[] }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ListarNivelesTitularUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(): Observable<ListarNivelesTitularResultado> {
    return this.maestros.listarNivelesTitular().pipe(
      map((niveles) => ({ exito: true as const, niveles })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo cargar el catálogo de niveles.'),
        })
      )
    );
  }
}
