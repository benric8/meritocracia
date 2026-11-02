import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { CarpetaPersonalMeritos } from '../../../domain/models/carpeta-personal-meritos.model';
import { CARPETA_PERSONAL_MERITOS_PORT } from '../../../domain/ports/carpeta-personal-meritos.port';

export type ObtenerCarpetaPersonalMeritosResultado =
  | { exito: true; carpeta: CarpetaPersonalMeritos }
  | { exito: false; detalle: DetalleError };

/** Carpeta Personal de Méritos (Anexo 05): todos los documentos de la ficha, rubro por rubro. */
@Injectable({ providedIn: 'root' })
export class ObtenerCarpetaPersonalMeritosUseCase {
  private readonly carpetas = inject(CARPETA_PERSONAL_MERITOS_PORT);

  ejecutar(idFicha: string): Observable<ObtenerCarpetaPersonalMeritosResultado> {
    return this.carpetas.obtener(idFicha).pipe(
      map((carpeta) => ({ exito: true as const, carpeta })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo consultar la carpeta personal de méritos.'),
        })
      )
    );
  }
}
