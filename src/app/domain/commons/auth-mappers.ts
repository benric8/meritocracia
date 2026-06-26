import { PersonaModel } from '../models/Persona.model';

export type PerfilUsuario = 'Administrador' | 'Usuario Registrador' | null;

export function nombreCompletoPersona(persona: PersonaModel): string {
  return [persona.primerApellido, persona.segundoApellido, persona.nombres]
    .filter((parte) => !!parte?.trim())
    .join(' ')
    .trim();
}

export function mapearPerfilUsuario(rol: string): PerfilUsuario {
  const normalizado = rol?.toLowerCase() ?? '';
  if (normalizado.includes('admin')) {
    return 'Administrador';
  }
  return 'Usuario Registrador';
}
