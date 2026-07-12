import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { USUARIOS_PORT } from '../../../domain/ports/usuarios.port';
import { mensajeErrorHttp } from '../../../infrastructure/api/http-error.util';

export interface CambiarEstadoUsuarioResultado {
  exito: boolean;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class CambiarEstadoUsuarioUseCase {
  private readonly usuarios = inject(USUARIOS_PORT);

  ejecutar(id: string): Observable<CambiarEstadoUsuarioResultado> {
    return this.usuarios.desactivar(id).pipe(
      map(() => ({ exito: true as const })),
      catchError((error) =>
        of({
          exito: false as const,
          mensaje: mensajeErrorHttp(error, 'No se pudo cambiar el estado del usuario.'),
        })
      )
    );
  }
}
