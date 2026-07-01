import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { mapearPerfilUsuario, nombreCompletoPersona } from '../../domain/commons/auth-mappers';
import { constantes } from '../../domain/commons/constants';
import { PersonaModel } from '../../domain/models/Persona.model';
import { AUTENTICACION_PORT } from '../../domain/ports/autenticacion.port';
import { SESION_PORT } from '../../domain/ports/sesion.port';
import { AuthStore } from '../../infrastructure/security/stores/auth.store';

export interface CompletarSesionPerfilParams {
  usuario: string;
  idPerfil: number;
  rol?: string;
  nombrePerfil?: string;
  persona?: PersonaModel;
}

export interface CompletarSesionPerfilResultado {
  exito: boolean;
  mensaje?: string;
}

/**
 * Caso de uso: cargar opciones del perfil seleccionado y abrir la sesión en el store.
 */
@Injectable({ providedIn: 'root' })
export class CompletarSesionPerfilUseCase {
  private readonly autenticacion = inject(AUTENTICACION_PORT);
  private readonly authStore = inject(AuthStore);
  private readonly sesion = inject(SESION_PORT);

  ejecutar(params: CompletarSesionPerfilParams): Observable<CompletarSesionPerfilResultado> {
    return this.autenticacion.opciones(params.usuario, params.idPerfil).pipe(
      map((respuesta) => {
        if (respuesta.codigo !== constantes.RES_COD_EXITO) {
          return {
            exito: false,
            mensaje: respuesta.descripcion || 'No se pudieron cargar las opciones del perfil.',
          };
        }

        const rol = params.rol || respuesta.data.rol;
        const perfil = mapearPerfilUsuario(rol, params.nombrePerfil);
        const nombre = params.persona ? nombreCompletoPersona(params.persona) : params.usuario;
        const token = this.sesion.getToken() ?? '';

        this.authStore.establecerSesion(params.usuario, nombre, perfil, token, respuesta.data.opciones);

        return { exito: true };
      })
    );
  }
}
