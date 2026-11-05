import { fotoSrc } from '../../domain/commons/foto-src';
import {
  CalculoEdadJuez,
  DatosSigaJuez,
  EdadJuez,
} from '../../domain/models/datos-siga-juez.model';
import {
  CalcularEdadJuezRequestDto,
  DatosSigaJuezDto,
  EdadJuezDto,
} from '../dto/remote/JuezResponse.dto';

export function toDatosSigaJuez(dto: DatosSigaJuezDto): DatosSigaJuez {
  const nombreCompleto = String(
    dto.nombreCompleto ?? dto.nombresCompletos ?? dto.apellidosNombres ?? ''
  ).trim();

  if (!nombreCompleto) {
    throw new Error('Datos SIGA recibidos sin nombre completo');
  }

  const fotoCruda = String(dto.foto ?? dto.fotoBase64 ?? dto.urlFoto ?? '');

  return {
    nombreCompleto,
    foto: fotoSrc(fotoCruda),
  };
}

export function toCalcularEdadJuezRequestDto(
  peticion: CalculoEdadJuez
): CalcularEdadJuezRequestDto {
  return {
    fechaNacimiento: peticion.fechaNacimiento.trim(),
    fechaValoracion: peticion.fechaValoracion.trim(),
  };
}

export function toEdadJuez(data: EdadJuezDto | number): EdadJuez {
  if (typeof data === 'number') {
    if (!Number.isFinite(data) || data < 0) {
      throw new Error('Edad recibida inválida');
    }
    return { edad: Math.trunc(data) };
  }

  const edad = data.edad ?? data.anios;
  if (edad == null || !Number.isFinite(Number(edad)) || Number(edad) < 0) {
    throw new Error('Edad recibida inválida');
  }

  return { edad: Math.trunc(Number(edad)) };
}
