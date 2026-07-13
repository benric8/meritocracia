import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { USUARIOS_PORT } from '../../../domain/ports/usuarios.port';

export type ResetearClaveUsuarioResultado =
  | { exito: true }
  | { exito: false; detalle: DetalleError };

@Injectable({ providedIn: 'root' })
export class ResetearClaveUsuarioUseCase {
  private readonly usuarios = inject(USUARIOS_PORT);

  ejecutar(id: string): Observable<ResetearClaveUsuarioResultado> {
    return this.usuarios.resetearClave(id).pipe(
      map(() => ({ exito: true as const })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo restablecer la contraseña.'),
        })
      )
    );
  }
}
