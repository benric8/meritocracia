import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FichaValoracion } from '../../../domain/models/ficha-valoracion.model';
import { TitularidadActual } from '../../../domain/models/rubro-antiguedad.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type GuardarTitularidadFichaResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class GuardarTitularidadFichaUseCase {
  private readonly fichas = inject(FICHA_PORT);

  ejecutar(
    fichaId: string,
    data: TitularidadActual,
    antiguedadId?: string | null
  ): Observable<GuardarTitularidadFichaResultado> {
    const id = fichaId?.trim() ?? '';
    const idAntiguedad = antiguedadId?.trim() ?? '';
    const esActualizacion = !!idAntiguedad;
    if (!id) {
      return of({ exito: false, mensaje: 'Identificador de ficha no válido.' });
    }
    if (!data.distritoJudicialId?.trim() || !data.cargoTitularId?.trim()) {
      return of({
        exito: false,
        mensaje: 'Complete distrito judicial y cargo titular.',
      });
    }
    if (!data.fechaJuramentacion) {
      return of({ exito: false, mensaje: 'Seleccione la fecha de juramentación.' });
    }
    if (!data.horaJuramento?.trim()) {
      return of({ exito: false, mensaje: 'Ingrese la hora de juramento.' });
    }
    if (!data.primeraEspecialidadId?.trim()) {
      return of({ exito: false, mensaje: 'Seleccione la primera especialidad.' });
    }

    return this.fichas.guardarTitularidad(id, data, idAntiguedad || null).pipe(
      map((ficha) => ({ exito: true as const, ficha })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(
            error,
            esActualizacion
              ? 'No se pudo actualizar la titularidad.'
              : 'No se pudo guardar la titularidad.'
          ),
        })
      )
    );
  }
}
