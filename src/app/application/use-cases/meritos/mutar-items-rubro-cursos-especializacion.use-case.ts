import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FichaValoracion } from '../../../domain/models/ficha-valoracion.model';
import { CursoEspecializacion } from '../../../domain/models/rubro-cursos-especializacion.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type MutarItemsRubroCursosEspecializacionResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class MutarItemsRubroCursosEspecializacionUseCase {
  private readonly fichas = inject(FICHA_PORT);

  upsertCurso(
    fichaId: string,
    item: CursoEspecializacion
  ): Observable<MutarItemsRubroCursosEspecializacionResultado> {
    return this.ejecutarMutacion(fichaId, () =>
      this.fichas.upsertCursoEspecializacion(fichaId, item)
    );
  }

  eliminarCurso(
    fichaId: string,
    itemId: string
  ): Observable<MutarItemsRubroCursosEspecializacionResultado> {
    return this.ejecutarMutacion(fichaId, () =>
      this.fichas.eliminarCursoEspecializacion(fichaId, itemId)
    );
  }

  private ejecutarMutacion(
    fichaId: string,
    operacion: () => Observable<FichaValoracion>
  ): Observable<MutarItemsRubroCursosEspecializacionResultado> {
    if (!fichaId?.trim()) {
      return of({ exito: false, mensaje: 'Identificador de ficha no válido.' });
    }

    return operacion().pipe(
      map((ficha) => ({ exito: true as const, ficha })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo actualizar el curso de especialización.'),
        })
      )
    );
  }
}
