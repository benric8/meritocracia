import { FichaValoracion } from '../../domain/models/ficha-valoracion.model';
import {
  crearRubroIdiomaVacio,
  EstudioIdioma,
  RubroIdioma,
} from '../../domain/models/rubro-idioma.model';
import {
  EstudioIdiomaDetalleDto,
  GuardarEstudioIdiomaRequestDto,
} from '../dto/remote/FichaIdiomaResponse.dto';

function aNumeroId(valor: string, etiqueta: string): number {
  const n = Number(String(valor ?? '').trim());
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${etiqueta} no válido.`);
  }
  return n;
}

function aEstudioIdiomaDesdeDto(
  dto: EstudioIdiomaDetalleDto,
  nombres: Partial<EstudioIdioma> = {}
): EstudioIdioma {
  const id = dto.idEstudioIdioma ?? dto.id;
  if (id == null) {
    throw new Error('Estudio de idioma recibido sin identificador.');
  }

  return {
    id: String(id),
    idiomaId: String(dto.idiomaId),
    idiomaNombre: nombres.idiomaNombre ?? '',
    idiomaTipo: nombres.idiomaTipo ?? '',
    nivelIdiomaId: String(dto.nivelIdiomaId),
    nivelIdiomaNombre: nombres.nivelIdiomaNombre ?? '',
    tipoDocumentoIdiomaId: String(dto.tipoDocumentoIdiomaId),
    tipoDocumentoNombre: nombres.tipoDocumentoNombre ?? '',
    institucionId: dto.institucionId != null ? String(dto.institucionId) : '',
    institucionNombre: nombres.institucionNombre ?? '',
    fechaObtencion: dto.fechaObtencion?.trim().slice(0, 10) ?? '',
    archivoId: dto.archivoId != null ? String(dto.archivoId) : null,
    puntaje: Number(dto.puntaje) || 0,
  };
}

function sumarPuntajeItems(items: EstudioIdioma[]): number {
  return items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
}

export function toRubroIdiomaDesdeDetalle(
  data: EstudioIdiomaDetalleDto[] | null | undefined
): RubroIdioma {
  const detalle = data ?? [];
  const items = detalle.map((dto) => aEstudioIdiomaDesdeDto(dto));

  return {
    items,
    puntajeTotal: sumarPuntajeItems(items),
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

  const body: GuardarEstudioIdiomaRequestDto = {
    rubroId,
    idiomaId: aNumeroId(item.idiomaId, 'Idioma'),
    nivelIdiomaId: aNumeroId(item.nivelIdiomaId, 'Nivel de idioma'),
    tipoDocumentoIdiomaId: aNumeroId(item.tipoDocumentoIdiomaId, 'Tipo de documento'),
    institucionId: item.institucionId?.trim()
      ? aNumeroId(item.institucionId, 'Institución')
      : null,
    fechaObtencion: fecha,
    archivoId: item.archivoId ? aNumeroId(item.archivoId, 'Archivo') : null,
  };

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}

export function aplicarEstudioIdiomaEnFicha(
  ficha: FichaValoracion,
  item: EstudioIdioma,
  respuesta: EstudioIdiomaDetalleDto
): FichaValoracion {
  const rubro = ficha.rubroIdioma ?? crearRubroIdiomaVacio();
  const guardado = aEstudioIdiomaDesdeDto(respuesta, {
    idiomaNombre: item.idiomaNombre,
    idiomaTipo: item.idiomaTipo,
    nivelIdiomaNombre: item.nivelIdiomaNombre,
    tipoDocumentoNombre: item.tipoDocumentoNombre,
    institucionNombre: item.institucionNombre,
  });

  const sinAnterior = rubro.items.filter(
    (actual) => actual.id !== item.id && actual.id !== guardado.id
  );
  const items = [...sinAnterior, guardado];

  return {
    ...ficha,
    rubroIdioma: {
      items,
      puntajeTotal: sumarPuntajeItems(items),
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function eliminarEstudioIdiomaEnFicha(
  ficha: FichaValoracion,
  itemId: string
): FichaValoracion {
  const rubro = ficha.rubroIdioma ?? crearRubroIdiomaVacio();
  const items = rubro.items.filter((item) => item.id !== itemId);

  return {
    ...ficha,
    rubroIdioma: {
      items,
      puntajeTotal: sumarPuntajeItems(items),
    },
    actualizadoEn: new Date().toISOString(),
  };
}
