import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PeticionPaginada, PAGINACION_POR_DEFECTO, ResultadoPaginado } from '../../../domain/models/paginacion.model';
import { UsuarioGestion } from '../../../domain/models/usuario-gestion.model';
import { USUARIOS_PORT } from '../../../domain/ports/usuarios.port';

@Injectable({ providedIn: 'root' })
export class ListarUsuariosUseCase {
  private readonly usuarios = inject(USUARIOS_PORT);

  ejecutar(
    peticion: PeticionPaginada = PAGINACION_POR_DEFECTO
  ): Observable<ResultadoPaginado<UsuarioGestion>> {
    return this.usuarios.listar(peticion);
  }
}
