import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { constantes } from '../../../domain/commons/constants';
import { PerfilUsuario } from '../../../domain/commons/auth-mappers';
import { MenuOpcion } from '../../../domain/dto/remote/OpcionesResponse.dto';

export type { PerfilUsuario };

// =========================================================================
// 2. EL ESTADO (La estructura de los datos que queremos recordar)
// =========================================================================
export interface AuthState {
  usuario: string | null;        // El código de usuario (ej: 'mhuertas')
  nombreCompleto: string | null; // Nombre completo del trabajador judicial
  perfil: PerfilUsuario;         // El rol asignado para controlar los menús
  token: string | null;          // El token JWT que nos dará el backend (Spring Boot)
  autenticado: boolean;          // Un interruptor: true si inició sesión, false si no
  opciones: MenuOpcion[];        // Opciones de menú autorizadas por perfil (RF001/RF003)
}

function leerOpciones(): MenuOpcion[] {
  try {
    const crudo = localStorage.getItem(constantes.USUARIO_OPCIONES);
    return crudo ? (JSON.parse(crudo) as MenuOpcion[]) : [];
  } catch {
    return [];
  }
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
      opciones: [],
    };
  }

  return {
    token,
    usuario: localStorage.getItem(constantes.USUARIO_CODIGO),
    nombreCompleto: localStorage.getItem(constantes.USUARIO),
    perfil: (localStorage.getItem(constantes.USUARIO_PERFIL) as PerfilUsuario) ?? null,
    autenticado: true,
    opciones: leerOpciones(),
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
    establecerSesion(
      usuario: string,
      nombre: string,
      perfil: PerfilUsuario,
      token: string,
      opciones: MenuOpcion[] = []
    ) {
      localStorage.setItem(constantes.JWT_TOKEN, token);
      localStorage.setItem(constantes.USUARIO_CODIGO, usuario);
      localStorage.setItem(constantes.USUARIO, nombre);
      localStorage.setItem(constantes.USUARIO_OPCIONES, JSON.stringify(opciones));
      if (perfil) {
        localStorage.setItem(constantes.USUARIO_PERFIL, perfil);
      }

      patchState(store, {
        usuario,
        nombreCompleto: nombre,
        perfil,
        token,
        autenticado: true,
        opciones,
      });
    },

    /**
     * Limpia el almacén y el navegador (Cerrar Sesión).
     */
    cerrarSesion() {
      localStorage.removeItem(constantes.JWT_TOKEN);
      localStorage.removeItem(constantes.JWT_TOKEN_NIVEL);
      localStorage.removeItem(constantes.USUARIO_CODIGO);
      localStorage.removeItem(constantes.USUARIO);
      localStorage.removeItem(constantes.USUARIO_PERFIL);
      localStorage.removeItem(constantes.USUARIO_OPCIONES);

      patchState(store, {
        usuario: null,
        nombreCompleto: null,
        perfil: null,
        token: null,
        autenticado: false,
        opciones: [],
      });
    },
  }))
);
