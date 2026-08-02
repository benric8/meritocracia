import { FichaValoracion } from '../../domain/models/ficha-valoracion.model';
import {
  crearRubroDistincionVacio,
  Distincion,
  RubroDistincion,
} from '../../domain/models/rubro-distincion.model';
import {
  DistincionDetalleDto,
  GuardarDistincionRequestDto,
} from '../dto/remote/FichaDistincionResponse.dto';

function aNumeroId(valor: string, etiqueta: string): number {
  const n = Number(String(valor ?? '').trim());
  if (!Number.isFinite(n) || n < 0) {
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

function aDistincionDesdeDto(
  dto: DistincionDetalleDto,
  nombres: Partial<Distincion> = {}
): Distincion {
  const id = dto.idDistincion ?? dto.id;
  if (id == null) {
    throw new Error('Distinción recibida sin identificador.');
  }

  return {
    id: String(id),
    tipoDistincionId: String(dto.tipoDistincionId),
    tipoDistincionNombre: nombres.tipoDistincionNombre ?? '',
    tipoDistincionCodigo: nombres.tipoDistincionCodigo ?? '',
    tipoDocumentoDistincionId: String(dto.tipoDocumentoDistincionId),
    tipoDocumentoDistincionNombre: nombres.tipoDocumentoDistincionNombre ?? '',
    descripcion: dto.descripcion?.trim() ?? '',
    fechaDistincion: dto.fechaDistincion?.trim().slice(0, 10) ?? '',
    institucionOtorgante: dto.institucionOtorgante?.trim() ?? '',
    paisId: dto.paisId != null ? String(dto.paisId) : '',
    paisNombre: nombres.paisNombre ?? '',
    archivoId: dto.archivoId != null ? String(dto.archivoId) : null,
    puntaje: Number(dto.puntaje) || 0,
  };
}

function sumarPuntajeItems(items: Distincion[]): number {
  return items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
}

export function toRubroDistincionDesdeDetalle(
  data: DistincionDetalleDto[] | null | undefined
): RubroDistincion {
  const detalle = data ?? [];
  const items = detalle.map((dto) => aDistincionDesdeDto(dto));

  return {
    items,
    puntajeTotal: sumarPuntajeItems(items),
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
    tipoDocumentoDistincionId: aNumeroId(
      item.tipoDocumentoDistincionId,
      'Tipo de documento'
    ),
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

export function aplicarDistincionEnFicha(
  ficha: FichaValoracion,
  item: Distincion,
  respuesta: DistincionDetalleDto
): FichaValoracion {
  const rubro = ficha.rubroDistincion ?? crearRubroDistincionVacio();
  const guardado = aDistincionDesdeDto(respuesta, {
    tipoDistincionNombre: item.tipoDistincionNombre,
    tipoDistincionCodigo: item.tipoDistincionCodigo,
    tipoDocumentoDistincionNombre: item.tipoDocumentoDistincionNombre,
    paisNombre: item.paisNombre,
  });

  const sinAnterior = rubro.items.filter(
    (actual) => actual.id !== item.id && actual.id !== guardado.id
  );
  const items = [...sinAnterior, guardado];

  return {
    ...ficha,
    rubroDistincion: {
      items,
      puntajeTotal: sumarPuntajeItems(items),
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function eliminarDistincionEnFicha(
  ficha: FichaValoracion,
  itemId: string
): FichaValoracion {
  const rubro = ficha.rubroDistincion ?? crearRubroDistincionVacio();
  const items = rubro.items.filter((item) => item.id !== itemId);

  return {
    ...ficha,
    rubroDistincion: {
      items,
      puntajeTotal: sumarPuntajeItems(items),
    },
    actualizadoEn: new Date().toISOString(),
  };
}
