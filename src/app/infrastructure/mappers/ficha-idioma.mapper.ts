import { EstudioIdioma, RubroIdioma } from '../../domain/models/rubro-idioma.model';
import {
  EstudioIdiomaDetalleDto,
  GuardarEstudioIdiomaRequestDto,
  ObtenerEstudiosIdiomaDataDto,
} from '../dto/remote/FichaIdiomaResponse.dto';

function aNumeroId(valor: string, etiqueta: string): number {
  const n = Number(String(valor ?? '').trim());
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`${etiqueta} no válido.`);
  }
  return n;
}

function aEstudioIdiomaDesdeDto(dto: EstudioIdiomaDetalleDto): EstudioIdioma {
  if (dto.idEstudioIdioma == null) {
    throw new Error('Estudio de idioma recibido sin identificador.');
  }

  return {
    id: String(dto.idEstudioIdioma),
    idiomaId: String(dto.idiomaId),
    idiomaNombre: dto.idiomaNombre?.trim() ?? '',
    idiomaTipo: '',
    nivelIdiomaId: String(dto.nivelIdiomaId),
    nivelIdiomaNombre: dto.nivelIdiomaNombre?.trim() ?? '',
    tipoDocumentoIdiomaId: String(dto.tipoDocumentoIdiomaId),
    tipoDocumentoNombre: dto.tipoDocumentoNombre?.trim() ?? '',
    institucionId: dto.institucionId != null ? String(dto.institucionId) : '',
    institucionNombre: dto.institucionNombre?.trim() ?? '',
    fechaObtencion: dto.fechaObtencion?.trim().slice(0, 10) ?? '',
    archivoId: dto.archivoId != null ? String(dto.archivoId) : null,
    puntaje: Number(dto.puntaje) || 0,
  };
}

function sumarPuntajeItems(items: EstudioIdioma[]): number {
  return items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
}

function normalizarListaDetalle(
  data: ObtenerEstudiosIdiomaDataDto | EstudioIdiomaDetalleDto[] | null | undefined
): EstudioIdiomaDetalleDto[] {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  return data.estudiosIdioma ?? [];
}

export function toRubroIdiomaDesdeDetalle(
  data: ObtenerEstudiosIdiomaDataDto | EstudioIdiomaDetalleDto[] | null | undefined
): RubroIdioma {
  const detalle = normalizarListaDetalle(data);
  const items = detalle.map((dto) => aEstudioIdiomaDesdeDto(dto));
  const puntajeApi =
    !Array.isArray(data) && data?.puntajeTotal != null
      ? Number(data.puntajeTotal)
      : sumarPuntajeItems(items);

  return {
    items,
    puntajeTotal: Number.isFinite(puntajeApi) ? puntajeApi : sumarPuntajeItems(items),
  };
}

export function toGuardarEstudioIdiomaRequestDto(
  fichaId: string,
  item: EstudioIdioma,
  rubroId: number,
  incluirFicha: boolean
): GuardarEstudioIdiomaRequestDto {
  if (!Number.isFinite(rubroId) || rubroId <= 0) {
    throw new Error('Rubro no válido.');
  }

  const fecha = item.fechaObtencion?.trim().slice(0, 10) ?? '';
  if (!fecha) {
    throw new Error('Fecha de obtención requerida.');
  }

  if (!item.institucionId?.trim()) {
    throw new Error('Institución requerida.');
  }

  const body: GuardarEstudioIdiomaRequestDto = {
    rubroId,
    idiomaId: aNumeroId(item.idiomaId, 'Idioma'),
    nivelIdiomaId: aNumeroId(item.nivelIdiomaId, 'Nivel de idioma'),
    tipoDocumentoIdiomaId: aNumeroId(item.tipoDocumentoIdiomaId, 'Tipo de documento'),
    institucionId: aNumeroId(item.institucionId, 'Institución'),
    fechaObtencion: fecha,
    archivoId: item.archivoId ? aNumeroId(item.archivoId, 'Archivo') : null,
  };

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}
