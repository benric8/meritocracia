import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { constantes } from '../../domain/commons/constants';
import { ResultadoInicioSesion } from '../../domain/models/resultado-inicio-sesion.model';
import { AUTENTICACION_PORT } from '../../domain/ports/autenticacion.port';
import { CompletarSesionPerfilUseCase } from './completar-sesion-perfil.use-case';

/**
 * Caso de uso: validar credenciales y decidir si abrir sesión directamente
 * o solicitar selección de perfil al usuario.
 */
@Injectable({ providedIn: 'root' })
export class IniciarSesionUseCase {
  private readonly autenticacion = inject(AUTENTICACION_PORT);
  private readonly completarSesion = inject(CompletarSesionPerfilUseCase);

  ejecutar(usuario: string, clave: string): Observable<ResultadoInicioSesion> {
    return this.autenticacion.login(usuario, clave).pipe(
      switchMap((respuesta) => {
        if (respuesta.codigo !== constantes.RES_COD_EXITO || !respuesta.data) {
          return of({
            tipo: 'error',
            mensaje: respuesta.descripcion || 'Credenciales inválidas.',
          } as const);
        }

        const perfiles = respuesta.data.perfiles ?? [];
        if (perfiles.length === 0) {
          return of({
            tipo: 'sin_perfiles',
            mensaje: 'El usuario no tiene perfiles asignados.',
          } as const);
        }

        if (perfiles.length === 1) {
          return this.completarSesion
            .ejecutar({
              usuario,
              idPerfil: perfiles[0].idPerfil,
              rol: perfiles[0].rol,
              nombrePerfil: perfiles[0].nombre,
              persona: respuesta.data.persona,
            })
            .pipe(
              map((resultado) =>
                resultado.exito
                  ? ({ tipo: 'sesion_completa', usuario } as const)
                  : ({ tipo: 'error', mensaje: resultado.mensaje ?? 'No se pudo completar la sesión.' } as const)
              )
            );
        }

        return of({
          tipo: 'seleccion_perfil',
          usuario,
          datosUsuario: respuesta.data,
          perfiles,
        } as const);
      })
    );
  }
}
