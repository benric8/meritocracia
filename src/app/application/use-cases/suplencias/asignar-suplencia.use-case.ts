import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { SuplenciaAsignada } from '../../../domain/models/suplencia.model';
import { SUPLENCIAS_PORT } from '../../../domain/ports/suplencias.port';

export type AsignarSuplenciaResultado =
  | { exito: true; suplencia: SuplenciaAsignada }
  | { exito: false; detalle: DetalleError };

@Injectable({ providedIn: 'root' })
export class AsignarSuplenciaUseCase {
  private readonly suplencias = inject(SUPLENCIAS_PORT);

  ejecutar(
    fichaId: string,
    registradorSuplenteId: number,
    motivo: string
  ): Observable<AsignarSuplenciaResultado> {
    return this.suplencias.asignar(fichaId, registradorSuplenteId, motivo).pipe(
      map((suplencia) => ({ exito: true as const, suplencia })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo asignar la suplencia.'),
        })
      )
    );
  }
}
