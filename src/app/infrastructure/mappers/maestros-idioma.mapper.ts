import { CatalogoItem } from '../../domain/models/catalogo-item.model';
import { IdiomaCatalogoItem, TipoIdioma } from '../../domain/models/rubro-idioma.model';
import {
  IdiomaItemDto,
  NivelIdiomaItemDto,
  TipoDocumentoIdiomaItemDto,
} from '../dto/remote/MaestrosIdiomaResponse.dto';

export function toIdiomaDesdeDto(dto: IdiomaItemDto): IdiomaCatalogoItem {
  if (dto.id == null) {
    throw new Error('Idioma recibido sin id');
  }

  const nombre = String(dto.nombre ?? '').trim();
  if (!nombre) {
    throw new Error('Idioma recibido sin nombre');
  }

  const tipo = String(dto.tipo ?? '').trim().toUpperCase() as TipoIdioma;
  if (tipo !== 'NATIVO' && tipo !== 'EXTRANJERO') {
    throw new Error('Tipo de idioma no válido.');
  }

  return {
    id: String(dto.id),
    nombre,
    tipo,
  };
}

export function toCatalogoDesdeNivelIdioma(dto: NivelIdiomaItemDto): CatalogoItem {
  if (dto.id == null) {
    throw new Error('Nivel de idioma recibido sin id');
  }

  const nombre = String(dto.descripcion ?? dto.codigo ?? '').trim();
  if (!nombre) {
    throw new Error('Nivel de idioma recibido sin descripción');
  }

  return {
    id: String(dto.id),
    nombre,
  };
}

export function toCatalogoDesdeTipoDocumentoIdioma(
  dto: TipoDocumentoIdiomaItemDto
): CatalogoItem {
  if (dto.id == null) {
    throw new Error('Tipo de documento recibido sin id');
  }

  const nombre = String(dto.descripcion ?? '').trim();
  if (!nombre) {
    throw new Error('Tipo de documento recibido sin descripción');
  }

  return {
    id: String(dto.id),
    nombre,
  };
}
