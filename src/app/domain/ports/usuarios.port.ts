import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { NuevoUsuarioGestion, UsuarioGestion } from '../models/usuario-gestion.model';
import { PeticionPaginada, ResultadoPaginado } from '../models/paginacion.model';

/**
 * Puerto de salida: gestión de usuarios (RF004).
 */
export interface UsuariosPort {
  listar(peticion: PeticionPaginada): Observable<ResultadoPaginado<UsuarioGestion>>;
  registrar(peticion: NuevoUsuarioGestion): Observable<UsuarioGestion>;
}

export const USUARIOS_PORT = new InjectionToken<UsuariosPort>('USUARIOS_PORT');
