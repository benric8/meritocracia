import { PersonaModel } from '../models/Persona.model';

export type PerfilUsuario = 'Administrador' | 'Usuario Registrador' | null;

export function nombreCompletoPersona(persona: PersonaModel): string {
  return [persona.primerApellido, persona.segundoApellido, persona.nombres]
    .filter((parte) => !!parte?.trim())
    .join(' ')
    .trim();
}

/**
 * Normaliza el rol del backend/login a un perfil de aplicación.
 * Usa `rol` y, si hace falta, `nombrePerfil` (p. ej. "Perfil Administrador").
 */
export function mapearPerfilUsuario(
  rol?: string | null,
  nombrePerfil?: string | null
): PerfilUsuario {
  const texto = `${rol ?? ''} ${nombrePerfil ?? ''}`.toLowerCase().trim();
  if (!texto) {
    return null;
  }
  if (texto.includes('administrador') || /\badmin\b/.test(texto)) {
    return 'Administrador';
  }
  return 'Usuario Registrador';
}

export function esPerfilAdministrador(
  perfil: PerfilUsuario | string | null | undefined
): boolean {
  if (!perfil) {
    return false;
  }
  if (perfil === 'Administrador') {
    return true;
  }
  if (perfil === 'Usuario Registrador') {
    return false;
  }
  return mapearPerfilUsuario(perfil) === 'Administrador';
}
