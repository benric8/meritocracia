import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { NuevoUsuarioGestion, UsuarioGestion, CambioContrasena } from '../models/usuario-gestion.model';
import { PeticionPaginada, ResultadoPaginado } from '../models/paginacion.model';

/**
 * Puerto de salida: gestión de usuarios (RF004).
 */
export interface UsuariosPort {
  listar(peticion: PeticionPaginada): Observable<ResultadoPaginado<UsuarioGestion>>;
  registrar(peticion: NuevoUsuarioGestion): Observable<UsuarioGestion>;
  resetearClave(id: string): Observable<void>;
  desactivar(id: string): Observable<void>;
  cambiarContrasena(peticion: CambioContrasena): Observable<void>;
}

export const USUARIOS_PORT = new InjectionToken<UsuariosPort>('USUARIOS_PORT');
