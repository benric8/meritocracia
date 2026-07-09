import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { NuevoUsuarioGestion, UsuarioGestion } from '../../../domain/models/usuario-gestion.model';
import { USUARIOS_PORT } from '../../../domain/ports/usuarios.port';
import { mensajeErrorHttp } from '../../../infrastructure/api/http-error.util';

export interface RegistrarUsuarioResultado {
  exito: boolean;
  usuario?: UsuarioGestion;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrarUsuarioUseCase {
  private readonly usuarios = inject(USUARIOS_PORT);

  ejecutar(peticion: NuevoUsuarioGestion): Observable<RegistrarUsuarioResultado> {
    return this.usuarios.registrar(peticion).pipe(
      map((usuario) => ({ exito: true as const, usuario })),
      catchError((error) =>
        of({
          exito: false as const,
          mensaje: mensajeErrorHttp(error, 'No se pudo registrar el usuario.'),
        })
      )
    );
  }
}
