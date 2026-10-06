import { constantes, tokenNiveles } from '../../../domain/commons/constants';
import { normalizarPerfil, PerfilUsuario, resolverPerfilUsuario } from '../../../domain/commons/auth-mappers';
import { ventanaRefreshVigente, segundosTranscurridos } from '../../../domain/commons/session-timers';
import { MenuOpcion } from '../../dto/remote/OpcionesResponse.dto';
import { descifrarValorSesionAlmacenado } from '../encryption/session-field-crypto.service';
import type { AuthState } from '../stores/auth.store';

const SIN_SESION: AuthState = {
  usuario: null,
  nombreCompleto: null,
  perfil: null,
  idPerfil: null,
  token: null,
  autenticado: false,
  opciones: [],
};

function leerNumeroAlmacenado(clave: string): number {
  const crudo = localStorage.getItem(clave);
  if (!crudo) {
    return -1;
  }
  const valor = Number(crudo);
  return Number.isFinite(valor) ? valor : -1;
}

function leerOpciones(): MenuOpcion[] {
  try {
    const crudo = localStorage.getItem(constantes.USUARIO_OPCIONES);
    return crudo ? (JSON.parse(crudo) as MenuOpcion[]) : [];
  } catch {
    return [];
  }
}

function sesionPersistidaEsOperativa(): boolean {
  const token = localStorage.getItem(constantes.JWT_TOKEN);
  const nivel = descifrarValorSesionAlmacenado(localStorage.getItem(constantes.JWT_TOKEN_NIVEL));

  if (!token || nivel !== tokenNiveles.NIVEL_OPCIONES) {
    return false;
  }

  const generadoMs = leerNumeroAlmacenado(constantes.DATETIME_NEW_TOKEN);
  const transcurrido = segundosTranscurridos(generadoMs > 0 ? generadoMs : null);
  const exps = leerNumeroAlmacenado(constantes.TOKEN_VALID_SEC);
  const refs = leerNumeroAlmacenado(constantes.REFRESH_TOKEN_VALID_SEC);

  return ventanaRefreshVigente(transcurrido, exps, refs);
}

/**
 * Reconstruye el estado de autenticación desde localStorage.
 * Solo marca sesión activa si el token sigue dentro de la ventana exps + refs.
 */
export function leerSesionPersistida(): AuthState {
  const token = localStorage.getItem(constantes.JWT_TOKEN);
  const nivel = descifrarValorSesionAlmacenado(localStorage.getItem(constantes.JWT_TOKEN_NIVEL));
  const idPerfilCrudo = localStorage.getItem(constantes.USUARIO_ID_PERFIL);
  const idPerfil = idPerfilCrudo ? Number(idPerfilCrudo) : null;
  const perfil = resolverPerfilUsuario({
    idPerfil: Number.isFinite(idPerfil) ? idPerfil : null,
    nombrePerfil: localStorage.getItem(constantes.USUARIO_PERFIL),
  });

  if (!token || nivel !== tokenNiveles.NIVEL_OPCIONES || !perfil || !sesionPersistidaEsOperativa()) {
    return { ...SIN_SESION };
  }

  return {
    token,
    usuario: descifrarValorSesionAlmacenado(localStorage.getItem(constantes.USUARIO_CODIGO)),
    nombreCompleto: descifrarValorSesionAlmacenado(localStorage.getItem(constantes.USUARIO)),
    perfil,
    idPerfil: Number.isFinite(idPerfil) ? idPerfil : null,
    autenticado: true,
    opciones: leerOpciones(),
  };
}
