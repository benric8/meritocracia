import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { constantes } from '../../../domain/commons/constants';

// =========================================================================
// 1. DEFINICIÓN DE ROLES (Basado estrictamente en el requerimiento del PJ)
// =========================================================================
// El documento exige dos perfiles: 'Administrador' y 'Usuario Registrador'
export type PerfilUsuario = 'Administrador' | 'Usuario Registrador' | null;

// =========================================================================
// 2. EL ESTADO (La estructura de los datos que queremos recordar)
// =========================================================================
export interface AuthState {
  usuario: string | null;        // El código de usuario (ej: 'mhuertas')
  nombreCompleto: string | null; // Nombre completo del trabajador judicial
  perfil: PerfilUsuario;         // El rol asignado para controlar los menús
  token: string | null;          // El token JWT que nos dará el backend (Spring Boot)
  autenticado: boolean;          // Un interruptor: true si inició sesión, false si no
}

// =========================================================================
// 3. ESTADO INICIAL — se hidrata desde el almacenamiento del navegador
// =========================================================================
// Así la sesión sobrevive a una recarga de página (F5) mientras el token siga
// guardado. Cuando integremos el backend, aquí también podríamos validar la
// expiración del token (constantes.TOKEN_VALID_SEC).
function leerEstadoInicial(): AuthState {
  const token = localStorage.getItem(constantes.JWT_TOKEN);

  if (!token) {
    return {
      usuario: null,
      nombreCompleto: null,
      perfil: null,
      token: null,
      autenticado: false,
    };
  }

  return {
    token,
    usuario: localStorage.getItem(constantes.USUARIO_CODIGO),
    nombreCompleto: localStorage.getItem(constantes.USUARIO),
    perfil: (localStorage.getItem(constantes.USUARIO_PERFIL) as PerfilUsuario) ?? null,
    autenticado: true,
  };
}

// =========================================================================
// 4. EL ALMACÉN (El Store hecho con Signals)
// =========================================================================
export const AuthStore = signalStore(
  // Almacén GLOBAL: cualquier pantalla o guard puede leerlo.
  { providedIn: 'root' },

  // Estado inicial leído del navegador (persistencia entre recargas).
  withState<AuthState>(leerEstadoInicial()),

  withMethods((store) => ({
    /**
     * Guarda los datos del usuario en el almacén y en el navegador
     * cuando el Login sea exitoso.
     */
    establecerSesion(usuario: string, nombre: string, perfil: PerfilUsuario, token: string) {
      localStorage.setItem(constantes.JWT_TOKEN, token);
      localStorage.setItem(constantes.USUARIO_CODIGO, usuario);
      localStorage.setItem(constantes.USUARIO, nombre);
      if (perfil) {
        localStorage.setItem(constantes.USUARIO_PERFIL, perfil);
      }

      patchState(store, {
        usuario,
        nombreCompleto: nombre,
        perfil,
        token,
        autenticado: true,
      });
    },

    /**
     * Limpia el almacén y el navegador (Cerrar Sesión).
     */
    cerrarSesion() {
      localStorage.removeItem(constantes.JWT_TOKEN);
      localStorage.removeItem(constantes.USUARIO_CODIGO);
      localStorage.removeItem(constantes.USUARIO);
      localStorage.removeItem(constantes.USUARIO_PERFIL);

      patchState(store, {
        usuario: null,
        nombreCompleto: null,
        perfil: null,
        token: null,
        autenticado: false,
      });
    },
  }))
);
