import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FichaValoracion } from '../../../domain/models/ficha-valoracion.model';
import { AsistenciaEventoAcademico } from '../../../domain/models/rubro-asistencias-eventos.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type MutarItemsRubroAsistenciasEventosResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class MutarItemsRubroAsistenciasEventosUseCase {
  private readonly fichas = inject(FICHA_PORT);

  upsertAsistencia(
    fichaId: string,
    item: AsistenciaEventoAcademico
  ): Observable<MutarItemsRubroAsistenciasEventosResultado> {
    return this.ejecutarMutacion(fichaId, () =>
      this.fichas.upsertAsistenciaEvento(fichaId, item)
    );
  }

  eliminarAsistencia(
    fichaId: string,
    itemId: string
  ): Observable<MutarItemsRubroAsistenciasEventosResultado> {
    return this.ejecutarMutacion(fichaId, () =>
      this.fichas.eliminarAsistenciaEvento(fichaId, itemId)
    );
  }

  private ejecutarMutacion(
    fichaId: string,
    operacion: () => Observable<FichaValoracion>
  ): Observable<MutarItemsRubroAsistenciasEventosResultado> {
    if (!fichaId?.trim()) {
      return of({ exito: false, mensaje: 'Identificador de ficha no válido.' });
    }

    return operacion().pipe(
      map((ficha) => ({ exito: true as const, ficha })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo actualizar la asistencia al evento.'),
        })
      )
    );
  }
}
