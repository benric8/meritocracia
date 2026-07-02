import { inject } from '@angular/core';

import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

import { constantes, tokenNiveles } from '../../../domain/commons/constants';

import { normalizarPerfil, PerfilUsuario, resolverPerfilUsuario } from '../../../domain/commons/auth-mappers';

import { MenuOpcion } from '../../../domain/dto/remote/OpcionesResponse.dto';

import { SESION_PORT } from '../../../domain/ports/sesion.port';

import { descifrarValorSesionAlmacenado } from '../encryption/session-field-crypto.service';



export type { PerfilUsuario };



export interface AuthState {

  usuario: string | null;

  nombreCompleto: string | null;

  perfil: PerfilUsuario;

  idPerfil: number | null;

  token: string | null;

  autenticado: boolean;

  opciones: MenuOpcion[];

}



function leerEstadoInicial(): AuthState {

  const token = localStorage.getItem(constantes.JWT_TOKEN);

  const nivel = descifrarValorSesionAlmacenado(localStorage.getItem(constantes.JWT_TOKEN_NIVEL));

  const perfilCrudo = localStorage.getItem(constantes.USUARIO_PERFIL);

  const idPerfilCrudo = localStorage.getItem(constantes.USUARIO_ID_PERFIL);

  const idPerfil = idPerfilCrudo ? Number(idPerfilCrudo) : null;



  let opciones: MenuOpcion[] = [];

  try {

    const crudo = localStorage.getItem(constantes.USUARIO_OPCIONES);

    opciones = crudo ? (JSON.parse(crudo) as MenuOpcion[]) : [];

  } catch {

    opciones = [];

  }



  const perfil = resolverPerfilUsuario({

    idPerfil: Number.isFinite(idPerfil) ? idPerfil : null,

    nombrePerfil: perfilCrudo,

  });



  if (!token || nivel !== tokenNiveles.NIVEL_OPCIONES || !perfil) {

    return {

      usuario: null,

      nombreCompleto: null,

      perfil: null,

      idPerfil: null,

      token: null,

      autenticado: false,

      opciones: [],

    };

  }



  return {

    token,

    usuario: descifrarValorSesionAlmacenado(localStorage.getItem(constantes.USUARIO_CODIGO)),

    nombreCompleto: descifrarValorSesionAlmacenado(localStorage.getItem(constantes.USUARIO)),

    perfil,

    idPerfil: Number.isFinite(idPerfil) ? idPerfil : null,

    autenticado: true,

    opciones,

  };

}



export const AuthStore = signalStore(

  { providedIn: 'root' },

  withState<AuthState>(leerEstadoInicial()),

  withMethods((store) => {

    const sesion = inject(SESION_PORT);



    return {

      establecerSesion(

        usuario: string,

        nombre: string,

        perfil: PerfilUsuario | string,

        token: string,

        opciones: MenuOpcion[] = [],

        idPerfil?: number | null

      ) {

        const perfilNormalizado =

          resolverPerfilUsuario({

            idPerfil,

            rol: typeof perfil === 'string' ? perfil : null,

            nombrePerfil: typeof perfil === 'string' ? perfil : null,

          }) ?? normalizarPerfil(perfil);

        sesion.setToken(token);

        sesion.setTokenNivel(tokenNiveles.NIVEL_OPCIONES);

        sesion.setUsuarioCodigo(usuario);

        sesion.setNombreCompleto(nombre);

        sesion.setOpciones(opciones);

        if (perfilNormalizado) {

          sesion.setPerfilAlmacenado(perfilNormalizado);

        }

        if (idPerfil != null && Number.isFinite(idPerfil)) {

          sesion.setIdPerfilAlmacenado(idPerfil);

        }


 
        patchState(store, {

          usuario,

          nombreCompleto: nombre,

          perfil: perfilNormalizado,

          idPerfil: idPerfil != null && Number.isFinite(idPerfil) ? idPerfil : null,

          token,

          autenticado: true,

          opciones,

        });

      },



      cerrarSesion() {

        sesion.limpiarSesion();



        patchState(store, {

          usuario: null,

          nombreCompleto: null,

          perfil: null,

          idPerfil: null,

          token: null,

          autenticado: false,

          opciones: [],

        });

      },



      actualizarToken(token: string) {

        sesion.setToken(token);

        patchState(store, { token });

      },

    };

  })

);

