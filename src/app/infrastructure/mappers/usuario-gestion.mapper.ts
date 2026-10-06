import {
  idPerfilDesdePerfilConocido,
  resolverPerfilUsuario,
} from '../../domain/commons/auth-mappers';
import { NuevoUsuarioGestion, UsuarioGestion } from '../../domain/models/usuario-gestion.model';
import { RegistrarUsuarioRequestDto } from '../dto/remote/RegistrarUsuarioRequest.dto';
import { UsuarioGestionDto } from '../dto/remote/RegistrarUsuarioResponse.dto';

export function toRegistrarUsuarioRequestDto(
  peticion: NuevoUsuarioGestion
): RegistrarUsuarioRequestDto {
  return {
    usuario: peticion.codigo.trim(),
    nombreCompleto: peticion.nombreCompleto.trim(),
    cargo: peticion.cargo.trim(),
    idPerfil: String(idPerfilDesdePerfilConocido(peticion.funcion)),
    dependencia: peticion.dependencia.trim(),
  };
}

function esActivo(valor: string | boolean | undefined): boolean {
  if (typeof valor === 'boolean') {
    return valor;
  }
  return String(valor ?? '').trim() === '1';
}

export function toUsuarioGestion(dto: UsuarioGestionDto): UsuarioGestion {
  if (dto.id == null) {
    throw new Error('Usuario recibido sin id');
  }

  const perfil = dto.perfiles?.[0];
  const funcion = resolverPerfilUsuario({
    idPerfil: perfil?.idPerfil,
    rol: perfil?.rol,
    nombrePerfil: perfil?.nombre,
  });

  if (!funcion) {
    throw new Error(`Perfil de usuario no reconocido: ${perfil?.nombre ?? perfil?.idPerfil}`);
  }

  return {
    id: String(dto.id),
    codigo: dto.usuario ?? '',
    nombreCompleto: dto.nombre ?? '',
    cargo: dto.cargo ?? '',
    dependencia: dto.dependencia ?? '',
    funcion,
    habilitado: esActivo(dto.activo),
  };
}
