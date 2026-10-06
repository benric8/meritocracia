import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { NuevoUsuarioGestion, UsuarioGestion } from '../../../domain/models/usuario-gestion.model';
import { USUARIOS_PORT } from '../../../domain/ports/usuarios.port';

export type RegistrarUsuarioResultado =
  | { exito: true; usuario: UsuarioGestion }
  | { exito: false; detalle: DetalleError };

@Injectable({ providedIn: 'root' })
export class RegistrarUsuarioUseCase {
  private readonly usuarios = inject(USUARIOS_PORT);

  ejecutar(peticion: NuevoUsuarioGestion): Observable<RegistrarUsuarioResultado> {
    return this.usuarios.registrar(peticion).pipe(
      map((usuario) => ({ exito: true as const, usuario })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo registrar el usuario.'),
        })
      )
    );
  }
}
