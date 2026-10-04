import { FichaValoracion } from '../../domain/models/ficha-valoracion.model';
import {
  crearRubroDemeritoVacio,
  Demerito,
  LIMITE_OBSERVACION_DEMERITO,
  RubroDemerito,
  TipoMedidaDemerito,
} from '../../domain/models/rubro-demerito.model';
import {
  DemeritoDetalleDto,
  GuardarDemeritoRequestDto,
} from '../dto/remote/FichaDemeritoResponse.dto';

function aNumeroId(valor: string, etiqueta: string): number {
  const n = Number(String(valor ?? '').trim());
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${etiqueta} no válido.`);
  }
  return n;
}

function quitarTildes(valor: string): string {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function aTipoMedida(valor: string): TipoMedidaDemerito {
  const tipo = quitarTildes(String(valor ?? ''))
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
  if (tipo === 'AMONESTACION' || tipo === 'MULTA' || tipo === 'SUSPENSION') {
    return tipo;
  }
  throw new Error('Tipo de medida no válido.');
}

function normalizarTipoDocumento(valor: string): string {
  return String(valor ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
}

function aEntero(valor: number, etiqueta: string): number {
  const n = Number(valor);
  if (!Number.isInteger(n)) {
    throw new Error(`${etiqueta} debe ser un entero.`);
  }
  return n;
}

function aDemeritoDesdeDto(dto: DemeritoDetalleDto): Demerito {
  const id = dto.idDemerito ?? dto.id;
  if (id == null) {
    throw new Error('Demérito recibido sin identificador.');
  }

  const puntaje = Number(dto.puntaje);

  return {
    id: String(id),
    tipoMedida: aTipoMedida(dto.tipoMedida),
    cantidad: aEntero(dto.cantidad, 'Cantidad'),
    descripcionDocumento: normalizarTipoDocumento(dto.descripcionDocumento),
    anioValoracion: aEntero(dto.anioValoracion, 'Año de valoración'),
    observacion: dto.observacion?.trim() ?? '',
    archivoId: dto.archivoId != null ? String(dto.archivoId) : null,
    puntaje: Number.isFinite(puntaje) ? puntaje : 0,
  };
}

export function toRubroDemeritoDesdeDetalle(
  data: DemeritoDetalleDto[] | null | undefined
): RubroDemerito {
  return {
    items: (data ?? []).map((dto) => aDemeritoDesdeDto(dto)),
    puntajeTotal: 0,
  };
}

export function toGuardarDemeritoRequestDto(
  fichaId: string,
  item: Demerito,
  rubroId: number,
  incluirFicha: boolean
): GuardarDemeritoRequestDto {
  if (!Number.isFinite(rubroId) || rubroId <= 0) {
    throw new Error('Rubro no válido.');
  }

  const tipoMedida = aTipoMedida(item.tipoMedida);
  const descripcionDocumento = normalizarTipoDocumento(item.descripcionDocumento);
  if (!descripcionDocumento) {
    throw new Error('Tipo de documento requerido.');
  }

  const cantidad = aEntero(item.cantidad, 'Cantidad');
  if (cantidad <= 0) {
    throw new Error('La cantidad debe ser un entero mayor que 0.');
  }

  const observacion = item.observacion?.trim() ?? '';
  if (!observacion) {
    throw new Error('Observación requerida.');
  }
  if (observacion.length > LIMITE_OBSERVACION_DEMERITO) {
    throw new Error(`La observación supera los ${LIMITE_OBSERVACION_DEMERITO} caracteres.`);
  }

  const body: GuardarDemeritoRequestDto = {
    rubroId,
    tipoMedida,
    cantidad,
    descripcionDocumento,
    observacion,
    archivoId: item.archivoId ? aNumeroId(item.archivoId, 'Archivo') : null,
  };

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}

export function aplicarDemeritoEnFicha(
  ficha: FichaValoracion,
  item: Demerito,
  respuesta: DemeritoDetalleDto
): FichaValoracion {
  const rubro = ficha.rubroDemerito ?? crearRubroDemeritoVacio();
  const guardado = aDemeritoDesdeDto(respuesta);
  const sinAnterior = rubro.items.filter(
    (actual) => actual.id !== item.id && actual.id !== guardado.id
  );

  return {
    ...ficha,
    rubroDemerito: {
      items: [...sinAnterior, guardado],
      puntajeTotal: rubro.puntajeTotal,
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function reemplazarDemeritosEnFicha(
  ficha: FichaValoracion,
  detalle: DemeritoDetalleDto[]
): FichaValoracion {
  const rubro = ficha.rubroDemerito ?? crearRubroDemeritoVacio();
  return {
    ...ficha,
    rubroDemerito: {
      items: detalle.map((dto) => aDemeritoDesdeDto(dto)),
      puntajeTotal: rubro.puntajeTotal,
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function eliminarDemeritoEnFicha(
  ficha: FichaValoracion,
  itemId: string
): FichaValoracion {
  const rubro = ficha.rubroDemerito ?? crearRubroDemeritoVacio();
  return {
    ...ficha,
    rubroDemerito: {
      items: rubro.items.filter((item) => item.id !== itemId),
      puntajeTotal: rubro.puntajeTotal,
    },
    actualizadoEn: new Date().toISOString(),
  };
}
