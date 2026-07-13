import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { CambioContrasena } from '../../../domain/models/usuario-gestion.model';
import { USUARIOS_PORT } from '../../../domain/ports/usuarios.port';

export type CambiarContrasenaResultado =
  | { exito: true }
  | { exito: false; detalle: DetalleError };

@Injectable({ providedIn: 'root' })
export class CambiarContrasenaUseCase {
  private readonly usuarios = inject(USUARIOS_PORT);

  ejecutar(peticion: CambioContrasena): Observable<CambiarContrasenaResultado> {
    return this.usuarios.cambiarContrasena(peticion).pipe(
      map(() => ({ exito: true as const })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo cambiar la contraseña.'),
        })
      )
    );
  }
}
