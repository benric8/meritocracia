import {
  CalculoEdadJuez,
  DatosSigaJuez,
  EdadJuez,
} from '../../domain/models/datos-siga-juez.model';
import {
  CalcularEdadJuezRequestDto,
  DatosSigaJuezDto,
  DatosSigaJuezRequestDto,
  EdadJuezDto,
} from '../dto/remote/JuezResponse.dto';

function normalizarFoto(valor: string): string {
  const foto = valor.trim();
  if (!foto) {
    return '';
  }

  if (
    foto.startsWith('data:') ||
    foto.startsWith('http://') ||
    foto.startsWith('https://') ||
    foto.startsWith('blob:')
  ) {
    return foto;
  }

  // Base64 puro (sin encabezado data URL).
  return `data:image/jpeg;base64,${foto}`;
}

export function toDatosSigaJuezRequestDto(dni: string): DatosSigaJuezRequestDto {
  return { dni: dni.trim() };
}

export function toDatosSigaJuez(dto: DatosSigaJuezDto): DatosSigaJuez {
  const nombreCompleto = String(
    dto.nombreCompleto ?? dto.nombresCompletos ?? dto.apellidosNombres ?? ''
  ).trim();

  if (!nombreCompleto) {
    throw new Error('Datos SIGA recibidos sin nombre completo');
  }

  const fotoCruda = String(dto.foto ?? dto.fotoBase64 ?? dto.urlFoto ?? '').trim();

  return {
    nombreCompleto,
    foto: normalizarFoto(fotoCruda),
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
