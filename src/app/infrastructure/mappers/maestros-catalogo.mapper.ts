import { CatalogoItem } from '../../domain/models/catalogo-item.model';
import {
  CargoMagistradoDto,
  ColegioProfesionalDto,
  DistritoJudicialDto,
  MaestroDescripcionDto,
  PaisDto,
  UniversidadDto,
} from '../dto/remote/MaestrosCatalogoResponse.dto';

function nombreDesdeDescripcion(dto: {
  nombre?: string;
  descripcion?: string;
}): string {
  return String(dto.nombre ?? dto.descripcion ?? '').trim();
}

export function toCatalogoDesdeDescripcion(dto: MaestroDescripcionDto): CatalogoItem {
  if (dto.id == null) {
    throw new Error('Ítem de catálogo recibido sin id');
  }

  const nombre = nombreDesdeDescripcion(dto);
  if (!nombre) {
    throw new Error('Ítem de catálogo recibido sin nombre');
  }

  return {
    id: String(dto.id),
    nombre,
  };
}

export function toCatalogoDesdeCargoMagistrado(dto: CargoMagistradoDto): CatalogoItem {
  if (dto.id == null) {
    throw new Error('Cargo de magistrado recibido sin id');
  }

  const nombre = nombreDesdeDescripcion(dto);
  if (!nombre) {
    throw new Error('Cargo de magistrado recibido sin descripción');
  }

  return {
    id: String(dto.id),
    nombre,
    nivelId: dto.idNivel != null ? String(dto.idNivel) : undefined,
  };
}

export function toCatalogoDesdeColegio(dto: ColegioProfesionalDto): CatalogoItem {
  if (dto.id == null) {
    throw new Error('Colegio profesional recibido sin id');
  }

  const nombre = String(dto.nombre ?? dto.sigla ?? dto.codigo ?? '').trim();
  if (!nombre) {
    throw new Error('Colegio profesional recibido sin nombre');
  }

  return {
    id: String(dto.id),
    nombre,
  };
}

export function toCatalogoDesdeDistrito(dto: DistritoJudicialDto): CatalogoItem {
  if (dto.id == null) {
    throw new Error('Distrito judicial recibido sin id');
  }

  const nombre = String(dto.nombre ?? dto.nombreCorto ?? dto.codigoSigla ?? '').trim();
  if (!nombre) {
    throw new Error('Distrito judicial recibido sin nombre');
  }

  return {
    id: String(dto.id),
    nombre,
  };
}

export function toCatalogoDesdeUniversidad(dto: UniversidadDto): CatalogoItem {
  if (dto.id == null) {
    throw new Error('Universidad recibida sin id');
  }

  const nombre = nombreDesdeDescripcion(dto);
  if (!nombre) {
    throw new Error('Universidad recibida sin nombre');
  }

  return {
    id: String(dto.id),
    nombre,
  };
}

export function toCatalogoDesdePais(dto: PaisDto): CatalogoItem {
  if (dto.id == null) {
    throw new Error('País recibido sin id');
  }

  const nombre = nombreDesdeDescripcion(dto);
  if (!nombre) {
    throw new Error('País recibido sin nombre');
  }

  return {
    id: String(dto.id),
    nombre,
  };
}

export function aListaCatalogoUnico<TDto extends { id?: number | string | null }>(
  dto: TDto | null | undefined,
  mapear: (item: TDto) => CatalogoItem
): CatalogoItem[] {
  if (!dto || dto.id == null) {
    return [];
  }

  try {
    return [mapear(dto)];
  } catch {
    return [];
  }
}
