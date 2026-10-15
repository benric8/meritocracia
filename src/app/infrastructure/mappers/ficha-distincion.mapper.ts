import { Distincion, RubroDistincion } from '../../domain/models/rubro-distincion.model';
import {
  DistincionDetalleDto,
  GuardarDistincionRequestDto,
  ObtenerDistincionesDataDto,
} from '../dto/remote/FichaDistincionResponse.dto';

function aNumeroId(valor: string, etiqueta: string): number {
  const n = Number(String(valor ?? '').trim());
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`${etiqueta} no válido.`);
  }
  return n;
}

function aNumeroIdOpcional(valor: string | null | undefined, etiqueta: string): number | null {
  const texto = String(valor ?? '').trim();
  if (!texto) {
    return null;
  }
  return aNumeroId(texto, etiqueta);
}

function aDistincionDesdeDto(dto: DistincionDetalleDto): Distincion {
  if (dto.idDistincion == null) {
    throw new Error('Distinción recibida sin identificador.');
  }

  return {
    id: String(dto.idDistincion),
    tipoDistincionId: String(dto.tipoDistincionId),
    tipoDistincionNombre: dto.tipoDistincionNombre?.trim() ?? '',
    tipoDistincionCodigo: '',
    tipoDocumentoDistincionId: String(dto.tipoDocumentoDistincionId),
    tipoDocumentoDistincionNombre: dto.tipoDocumentoDistincionNombre?.trim() ?? '',
    descripcion: dto.descripcion?.trim() ?? '',
    fechaDistincion: dto.fechaDistincion?.trim().slice(0, 10) ?? '',
    institucionOtorgante: dto.institucionOtorgante?.trim() ?? '',
    paisId: dto.paisId != null ? String(dto.paisId) : '',
    paisNombre: dto.paisNombre?.trim() ?? '',
    archivoId: dto.archivoId != null ? String(dto.archivoId) : null,
    puntaje: Number(dto.puntaje) || 0,
  };
}

function sumarPuntajeItems(items: Distincion[]): number {
  return items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
}

function normalizarListaDetalle(
  data: ObtenerDistincionesDataDto | DistincionDetalleDto[] | null | undefined
): DistincionDetalleDto[] {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  return data.distinciones ?? [];
}

export function toRubroDistincionDesdeDetalle(
  data: ObtenerDistincionesDataDto | DistincionDetalleDto[] | null | undefined
): RubroDistincion {
  const detalle = normalizarListaDetalle(data);
  const items = detalle.map((dto) => aDistincionDesdeDto(dto));
  const puntajeApi =
    !Array.isArray(data) && data?.puntajeTotal != null
      ? Number(data.puntajeTotal)
      : sumarPuntajeItems(items);

  return {
    items,
    puntajeTotal: Number.isFinite(puntajeApi) ? puntajeApi : sumarPuntajeItems(items),
  };
}

export function toGuardarDistincionRequestDto(
  fichaId: string,
  item: Distincion,
  rubroId: number,
  incluirFicha: boolean
): GuardarDistincionRequestDto {
  if (!Number.isFinite(rubroId) || rubroId <= 0) {
    throw new Error('Rubro no válido.');
  }

  const fecha = item.fechaDistincion?.trim().slice(0, 10) ?? '';
  if (!fecha) {
    throw new Error('Fecha de distinción requerida.');
  }

  const body: GuardarDistincionRequestDto = {
    rubroId,
    tipoDistincionId: aNumeroId(item.tipoDistincionId, 'Tipo de distinción'),
    tipoDocumentoDistincionId: aNumeroId(item.tipoDocumentoDistincionId, 'Tipo de documento'),
    descripcion: item.descripcion?.trim() ? item.descripcion.trim() : null,
    fechaDistincion: fecha,
    institucionOtorgante: item.institucionOtorgante?.trim()
      ? item.institucionOtorgante.trim()
      : null,
    paisId: aNumeroIdOpcional(item.paisId, 'País'),
    archivoId: item.archivoId ? aNumeroId(item.archivoId, 'Archivo') : null,
  };

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}
