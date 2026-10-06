import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { RubroCertamenesAcademicos } from '../../../domain/models/rubro-certamenes-academicos.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type ObtenerRubroCertamenesAcademicosFichaResultado =
  | { exito: true; rubro: RubroCertamenesAcademicos }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ObtenerRubroCertamenesAcademicosFichaUseCase {
  private readonly fichas = inject(FICHA_PORT);

  ejecutar(fichaId: string): Observable<ObtenerRubroCertamenesAcademicosFichaResultado> {
    const id = fichaId?.trim() ?? '';
    if (!id) {
      return of({ exito: false, mensaje: 'Identificador de ficha no válido.' });
    }

    return this.fichas.obtenerRubroCertamenesAcademicos(id).pipe(
      map((rubro) => ({ exito: true as const, rubro })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo obtener el subrubro E4.'),
        })
      )
    );
  }
}
