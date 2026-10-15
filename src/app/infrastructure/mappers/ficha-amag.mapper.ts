import { EstudioAmag, RubroAmag } from '../../domain/models/rubro-amag.model';
import {
  EstudioAmagDetalleDto,
  GuardarEstudioAmagRequestDto,
  ObtenerEstudiosAmagDataDto,
} from '../dto/remote/FichaAmagResponse.dto';

function aNumeroId(valor: string, etiqueta: string): number {
  const n = Number(String(valor ?? '').trim());
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${etiqueta} no válido.`);
  }
  return n;
}

function aEstudioAmagDesdeDto(dto: EstudioAmagDetalleDto): EstudioAmag {
  if (dto.idEstudioAmag == null) {
    throw new Error('Estudio AMAG recibido sin identificador.');
  }

  return {
    id: String(dto.idEstudioAmag),
    tipoCursoId: String(dto.cursoAmagId),
    tipoCursoNombre: dto.cursoAmagNombre?.trim() ?? '',
    nota: Number(dto.nota) || 0,
    descripcion: dto.descripcion?.trim() ?? '',
    anio: Number(dto.anio) || 0,
    puntaje: Number(dto.puntaje) || 0,
  };
}

function sumarPuntajeItems(items: EstudioAmag[]): number {
  return items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
}

function normalizarListaDetalle(
  data: ObtenerEstudiosAmagDataDto | EstudioAmagDetalleDto[] | null | undefined
): EstudioAmagDetalleDto[] {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  return data.estudiosAmag ?? [];
}

export function toRubroAmagDesdeDetalle(
  data: ObtenerEstudiosAmagDataDto | EstudioAmagDetalleDto[] | null | undefined
): RubroAmag {
  const detalle = normalizarListaDetalle(data);
  const items = detalle.map((dto) => aEstudioAmagDesdeDto(dto));
  const puntajeApi =
    !Array.isArray(data) && data?.puntajeTotal != null
      ? Number(data.puntajeTotal)
      : sumarPuntajeItems(items);

  return {
    items,
    puntajeTotal: Number.isFinite(puntajeApi) ? puntajeApi : sumarPuntajeItems(items),
  };
}

export function toGuardarEstudioAmagRequestDto(
  fichaId: string,
  item: EstudioAmag,
  rubroId: number,
  incluirFicha: boolean
): GuardarEstudioAmagRequestDto {
  if (!Number.isFinite(rubroId) || rubroId <= 0) {
    throw new Error('Rubro no válido.');
  }

  const body: GuardarEstudioAmagRequestDto = {
    rubroId,
    cursoAmagId: aNumeroId(item.tipoCursoId, 'Tipo de curso'),
    nota: Number(item.nota),
    descripcion: item.descripcion.trim(),
    anio: Number(item.anio),
  };

  if (!body.descripcion) {
    throw new Error('Descripción del curso requerida.');
  }
  if (!Number.isFinite(body.nota) || body.nota < 13 || body.nota > 20) {
    throw new Error('La nota debe estar entre 13 y 20.');
  }
  if (body.descripcion.length > 300) {
    throw new Error('La descripción admite hasta 300 caracteres.');
  }
  if (!Number.isFinite(body.anio) || body.anio < 1950 || body.anio > 2100) {
    throw new Error('Año del curso no válido.');
  }

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}
