import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { RubroIdioma } from '../../../domain/models/rubro-idioma.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type ObtenerRubroIdiomaFichaResultado =
  | { exito: true; rubro: RubroIdioma }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ObtenerRubroIdiomaFichaUseCase {
  private readonly fichas = inject(FICHA_PORT);

  ejecutar(fichaId: string): Observable<ObtenerRubroIdiomaFichaResultado> {
    const id = fichaId?.trim() ?? '';
    if (!id) {
      return of({ exito: false, mensaje: 'Identificador de ficha no válido.' });
    }

    return this.fichas.obtenerRubroIdioma(id).pipe(
      map((rubro) => ({ exito: true as const, rubro })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo obtener el rubro de estudios de idioma.'),
        })
      )
    );
  }
}
