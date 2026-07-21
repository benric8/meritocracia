import { FichaValoracion } from '../../domain/models/ficha-valoracion.model';
import { crearRubroAmagVacio, EstudioAmag, RubroAmag } from '../../domain/models/rubro-amag.model';
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

function aEstudioAmagDesdeDto(dto: EstudioAmagDetalleDto, tipoNombre = ''): EstudioAmag {
  return {
    id: String(dto.idMagistratura),
    tipoCursoId: String(dto.tipoCurso),
    tipoCursoNombre: tipoNombre,
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
  incluirFicha: boolean
): GuardarEstudioAmagRequestDto {
  const body: GuardarEstudioAmagRequestDto = {
    tipoCurso: aNumeroId(item.tipoCursoId, 'Tipo de curso'),
    nota: Number(item.nota),
    descripcion: item.descripcion.trim(),
    anio: Number(item.anio),
  };

  if (!body.descripcion) {
    throw new Error('Descripción del curso requerida.');
  }
  if (!Number.isFinite(body.nota) || body.nota < 0 || body.nota > 20) {
    throw new Error('La nota debe estar entre 0 y 20.');
  }
  if (!Number.isFinite(body.anio) || body.anio < 1950 || body.anio > 2100) {
    throw new Error('Año del curso no válido.');
  }

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}

export function aplicarEstudioAmagEnFicha(
  ficha: FichaValoracion,
  item: EstudioAmag,
  respuesta: EstudioAmagDetalleDto
): FichaValoracion {
  const rubro = ficha.rubroAmag ?? crearRubroAmagVacio();
  const guardado = aEstudioAmagDesdeDto(respuesta, item.tipoCursoNombre);

  const sinAnterior = rubro.items.filter(
    (actual) => actual.id !== item.id && actual.id !== guardado.id
  );
  const items = [...sinAnterior, guardado];

  return {
    ...ficha,
    rubroAmag: {
      items,
      puntajeTotal: sumarPuntajeItems(items),
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function eliminarEstudioAmagEnFicha(
  ficha: FichaValoracion,
  itemId: string
): FichaValoracion {
  const rubro = ficha.rubroAmag ?? crearRubroAmagVacio();
  const items = rubro.items.filter((item) => item.id !== itemId);

  return {
    ...ficha,
    rubroAmag: {
      items,
      puntajeTotal: sumarPuntajeItems(items),
    },
    actualizadoEn: new Date().toISOString(),
  };
}
