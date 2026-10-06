import { CatalogoItem } from '../../domain/models/catalogo-item.model';
import { TipoPublicacionItemDto } from '../dto/remote/MaestrosPublicacionResponse.dto';

export function toCatalogoDesdeTipoPublicacion(dto: TipoPublicacionItemDto): CatalogoItem {
  if (dto.id == null) {
    throw new Error('Tipo de publicación recibido sin id');
  }

  const nombre = String(dto.descripcion ?? dto.codigo ?? '').trim();
  if (!nombre) {
    throw new Error('Tipo de publicación recibido sin descripción');
  }

  return {
    id: String(dto.id),
    nombre,
  };
}
