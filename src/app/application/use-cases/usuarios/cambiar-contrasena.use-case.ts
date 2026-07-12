import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { CambioContrasena } from '../../../domain/models/usuario-gestion.model';
import { USUARIOS_PORT } from '../../../domain/ports/usuarios.port';
import { mensajeErrorHttp } from '../../../infrastructure/api/http-error.util';

export interface CambiarContrasenaResultado {
  exito: boolean;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class CambiarContrasenaUseCase {
  private readonly usuarios = inject(USUARIOS_PORT);

  ejecutar(peticion: CambioContrasena): Observable<CambiarContrasenaResultado> {
    return this.usuarios.cambiarContrasena(peticion).pipe(
      map(() => ({ exito: true as const })),
      catchError((error) =>
        of({
          exito: false as const,
          mensaje: mensajeErrorHttp(error, 'No se pudo cambiar la contraseña.'),
        })
      )
    );
  }
}
