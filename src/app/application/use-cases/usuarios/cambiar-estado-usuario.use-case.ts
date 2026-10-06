import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { USUARIOS_PORT } from '../../../domain/ports/usuarios.port';

export type CambiarEstadoUsuarioResultado =
  | { exito: true }
  | { exito: false; detalle: DetalleError };

@Injectable({ providedIn: 'root' })
export class CambiarEstadoUsuarioUseCase {
  private readonly usuarios = inject(USUARIOS_PORT);

  ejecutar(id: string, activo: 0 | 1): Observable<CambiarEstadoUsuarioResultado> {
    return this.usuarios.desactivar(id, activo).pipe(
      map(() => ({ exito: true as const })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo cambiar el estado del usuario.'),
        })
      )
    );
  }
}
