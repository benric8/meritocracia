import { NivelTitular } from '../../domain/models/nivel-titular.model';
import { NivelTitularDto } from '../dto/remote/MaestrosNivelResponse.dto';

export function toNivelTitular(dto: NivelTitularDto): NivelTitular {
  if (dto.id == null) {
    throw new Error('Nivel titular recibido sin id');
  }

  const nombre = String(dto.nombre ?? dto.descripcion ?? '').trim();
  if (!nombre) {
    throw new Error('Nivel titular recibido sin nombre');
  }

  return {
    id: String(dto.id),
    nombre,
    abreviatura: dto.abreviatura ? String(dto.abreviatura).trim() : undefined,
  };
}
