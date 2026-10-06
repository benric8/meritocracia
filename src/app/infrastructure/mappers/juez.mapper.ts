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

/**
 * Convierte base64 puro (p. ej. `/9j/...` JPEG) a data URL usable en `<img [src]>`.
 */
export function normalizarFotoSiga(valor: string): string {
  const foto = valor.replace(/\s/g, '').trim();
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

  const mime = detectarMimeBase64(foto);
  return `data:${mime};base64,${foto}`;
}

function detectarMimeBase64(base64: string): string {
  // JPEG: /9j/  — PNG: iVBOR  — GIF: R0lGO  — WEBP: UklGR
  if (base64.startsWith('/9j/')) {
    return 'image/jpeg';
  }
  if (base64.startsWith('iVBOR')) {
    return 'image/png';
  }
  if (base64.startsWith('R0lGO')) {
    return 'image/gif';
  }
  if (base64.startsWith('UklGR')) {
    return 'image/webp';
  }
  return 'image/jpeg';
}

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
    foto: normalizarFotoSiga(fotoCruda),
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
