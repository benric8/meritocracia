import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FichaValoracion } from '../../../domain/models/ficha-valoracion.model';
import { CertamenAcademico } from '../../../domain/models/rubro-certamenes-academicos.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type MutarItemsRubroCertamenesAcademicosResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class MutarItemsRubroCertamenesAcademicosUseCase {
  private readonly fichas = inject(FICHA_PORT);

  upsertCertamen(
    fichaId: string,
    item: CertamenAcademico
  ): Observable<MutarItemsRubroCertamenesAcademicosResultado> {
    return this.ejecutarMutacion(fichaId, () => this.fichas.upsertCertamenAcademico(fichaId, item));
  }

  eliminarCertamen(
    fichaId: string,
    itemId: string
  ): Observable<MutarItemsRubroCertamenesAcademicosResultado> {
    return this.ejecutarMutacion(fichaId, () =>
      this.fichas.eliminarCertamenAcademico(fichaId, itemId)
    );
  }

  private ejecutarMutacion(
    fichaId: string,
    operacion: () => Observable<FichaValoracion>
  ): Observable<MutarItemsRubroCertamenesAcademicosResultado> {
    if (!fichaId?.trim()) {
      return of({ exito: false, mensaje: 'Identificador de ficha no válido.' });
    }

    return operacion().pipe(
      map((ficha) => ({ exito: true as const, ficha })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo actualizar el certamen académico.'),
        })
      )
    );
  }
}
