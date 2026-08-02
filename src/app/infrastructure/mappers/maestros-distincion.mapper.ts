import { CatalogoItem } from '../../domain/models/catalogo-item.model';
import { TipoDistincionCatalogoItem } from '../../domain/models/rubro-distincion.model';
import {
  TipoDocumentoDistincionItemDto,
  TipoDistincionItemDto,
} from '../dto/remote/MaestrosDistincionResponse.dto';

export function toCatalogoDesdeTipoDocumentoDistincion(
  dto: TipoDocumentoDistincionItemDto
): CatalogoItem {
  if (dto.id == null) {
    throw new Error('Tipo de documento distinción recibido sin id');
  }

  const nombre = String(dto.descripcion ?? dto.codigo ?? '').trim();
  if (!nombre) {
    throw new Error('Tipo de documento distinción recibido sin descripción');
  }

  return {
    id: String(dto.id),
    nombre,
  };
}

export function toTipoDistincionDesdeDto(dto: TipoDistincionItemDto): TipoDistincionCatalogoItem {
  if (dto.id == null) {
    throw new Error('Tipo de distinción recibido sin id');
  }

  const nombre = String(dto.descripcion ?? dto.codigo ?? '').trim();
  const codigo = String(dto.codigo ?? '').trim();
  if (!nombre) {
    throw new Error('Tipo de distinción recibido sin descripción');
  }

  return {
    id: String(dto.id),
    nombre,
    codigo,
  };
}
