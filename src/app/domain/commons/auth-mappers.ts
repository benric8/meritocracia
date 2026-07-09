import { PersonaModel } from '../models/Persona.model';

/** Perfiles conocidos por la aplicación. Añadir aquí cada perfil nuevo. */
export const PERFILES = {
  ADMIN: 'Administrador',
  REGISTRADOR: 'Usuario Registrador',
} as const;

/**
 * Identificadores de perfil del backend (`Perfil.idPerfil`).
 * Deben coincidir con el catálogo del servicio de autenticación.
 */
export const IDS_PERFIL = {
  ADMIN: 1,
  REGISTRADOR: 2,
} as const;

export type PerfilUsuarioConocido = (typeof PERFILES)[keyof typeof PERFILES];
export type PerfilUsuario = PerfilUsuarioConocido | null;

export interface ResolverPerfilParams {
  idPerfil?: number | null;
  rol?: string | null;
  nombrePerfil?: string | null;
}

interface ReglaMapeoPerfil {
  perfil: PerfilUsuarioConocido;
  patrones: RegExp[];
}

/** Mapeo principal: idPerfil del backend → perfil de aplicación. */
const MAPEO_ID_PERFIL: Record<number, PerfilUsuarioConocido> = {
  [IDS_PERFIL.ADMIN]: PERFILES.ADMIN,
  [IDS_PERFIL.REGISTRADOR]: PERFILES.REGISTRADOR,
};

/**
 * Respaldo por texto cuando no hay idPerfil (p. ej. sesión antigua en localStorage).
 * Para escalar: añadir una entrada con el perfil y sus patrones de texto.
 */
const REGLAS_MAPEO_PERFIL: ReglaMapeoPerfil[] = [
  {
    perfil: PERFILES.ADMIN,
    patrones: [/administrador/i, /\badmin\b/i],
  },
  {
    perfil: PERFILES.REGISTRADOR,
    patrones: [/registrador/i],
  },
];

export function nombreCompletoPersona(persona: PersonaModel): string {
  return [persona.primerApellido, persona.segundoApellido, persona.nombres]
    .filter((parte) => !!parte?.trim())
    .join(' ')
    .trim();
}

export function idPerfilDesdePerfilConocido(perfil: PerfilUsuarioConocido): number {
  return perfil === PERFILES.ADMIN ? IDS_PERFIL.ADMIN : IDS_PERFIL.REGISTRADOR;
}

export function mapearPerfilPorId(idPerfil?: number | null): PerfilUsuario {
  if (idPerfil == null || !Number.isFinite(idPerfil)) {
    return null;
  }

  return MAPEO_ID_PERFIL[idPerfil] ?? null;
}

/**
 * Respaldo por rol/nombre cuando el idPerfil no está disponible.
 */
export function mapearPerfilPorTexto(
  rol?: string | null,
  nombrePerfil?: string | null
): PerfilUsuario {
  const texto = `${rol ?? ''} ${nombrePerfil ?? ''}`.trim();
  if (!texto) {
    return null;
  }

  for (const regla of REGLAS_MAPEO_PERFIL) {
    if (regla.patrones.some((patron) => patron.test(texto))) {
      return regla.perfil;
    }
  }

  return null;
}

/**
 * Resuelve el perfil priorizando idPerfil del backend y usando texto solo como respaldo.
 */
export function resolverPerfilUsuario(params: ResolverPerfilParams): PerfilUsuario {
  const porId = mapearPerfilPorId(params.idPerfil);
  if (porId) {
    return porId;
  }

  return mapearPerfilPorTexto(params.rol, params.nombrePerfil);
}

/** @deprecated Usar `resolverPerfilUsuario` o `mapearPerfilPorTexto`. */
export function mapearPerfilUsuario(
  rol?: string | null,
  nombrePerfil?: string | null
): PerfilUsuario {
  return mapearPerfilPorTexto(rol, nombrePerfil);
}

export function esPerfilConocido(
  perfil: string | null | undefined
): perfil is PerfilUsuarioConocido {
  if (!perfil) {
    return false;
  }
  return Object.values(PERFILES).includes(perfil as PerfilUsuarioConocido);
}

export function normalizarPerfil(
  perfil: PerfilUsuario | string | null | undefined
): PerfilUsuario {
  if (!perfil) {
    return null;
  }
  if (esPerfilConocido(perfil)) {
    return perfil;
  }
  return mapearPerfilPorTexto(perfil);
}

export function esPerfilAdministrador(
  perfil: PerfilUsuario | string | null | undefined
): boolean {
  return normalizarPerfil(perfil) === PERFILES.ADMIN;
}
