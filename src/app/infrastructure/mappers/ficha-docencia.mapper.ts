import { FichaValoracion } from '../../domain/models/ficha-valoracion.model';
import {
  crearRubroDocenciaVacio,
  DocenciaUniversitaria,
  LIMITES_DOCENCIA,
  OrdenJuridicoDocencia,
  RubroDocencia,
} from '../../domain/models/rubro-docencia.model';
import {
  DocenciaDetalleDto,
  GuardarDocenciaRequestDto,
} from '../dto/remote/FichaDocenciaResponse.dto';

function aNumeroId(valor: string, etiqueta: string): number {
  const n = Number(String(valor ?? '').trim());
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${etiqueta} no válido.`);
  }
  return n;
}

function aOrdenJuridico(valor: string): OrdenJuridicoDocencia {
  const orden = String(valor ?? '')
    .trim()
    .toUpperCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');
  if (orden === 'JURIDICO' || orden === 'NO JURIDICO') {
    return orden;
  }
  throw new Error('Orden jurídico no válido.');
}

/** El API también acepta "DECLARACION JURADA"; el formulario usa el código con guion bajo. */
function normalizarTipoDocumento(valor: string): string {
  return String(valor ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
}

function aTextoLimitado(valor: string, maximo: number, etiqueta: string): string {
  const texto = valor.trim();
  if (texto.length > maximo) {
    throw new Error(`${etiqueta} supera los ${maximo} caracteres.`);
  }
  return texto;
}

function aDocenciaDesdeDto(dto: DocenciaDetalleDto): DocenciaUniversitaria {
  const id = dto.idDocencia ?? dto.id;
  if (id == null) {
    throw new Error('Docencia recibida sin identificador.');
  }

  const horas = Number(dto.horasSemanales);
  const puntaje = Number(dto.puntaje);

  return {
    id: String(id),
    descripcionDocumento: normalizarTipoDocumento(dto.descripcionDocumento),
    universidad: dto.universidad?.trim() ?? '',
    horasSemanales: Number.isFinite(horas) ? horas : 0,
    fechaInicio: dto.fechaInicio?.trim().slice(0, 10) ?? '',
    fechaFin: dto.fechaFin?.trim().slice(0, 10) ?? '',
    ordenJuridico: aOrdenJuridico(dto.ordenJuridico),
    especialidad: dto.especialidad?.trim() ?? '',
    materia: dto.materia?.trim() ?? '',
    categoria: dto.categoria?.trim() ?? '',
    condicion: dto.condicion?.trim() ?? '',
    archivoId: dto.archivoId != null ? String(dto.archivoId) : null,
    puntaje: Number.isFinite(puntaje) ? puntaje : 0,
  };
}

export function toRubroDocenciaDesdeDetalle(
  data: DocenciaDetalleDto[] | null | undefined
): RubroDocencia {
  return {
    items: (data ?? []).map((dto) => aDocenciaDesdeDto(dto)),
    puntajeTotal: 0,
  };
}

export function toGuardarDocenciaRequestDto(
  fichaId: string,
  item: DocenciaUniversitaria,
  rubroId: number,
  incluirFicha: boolean
): GuardarDocenciaRequestDto {
  if (!Number.isFinite(rubroId) || rubroId <= 0) {
    throw new Error('Rubro no válido.');
  }

  const descripcionDocumento = normalizarTipoDocumento(item.descripcionDocumento);
  if (!descripcionDocumento) {
    throw new Error('Tipo de documento requerido.');
  }

  const universidad = aTextoLimitado(
    item.universidad ?? '',
    LIMITES_DOCENCIA.universidad,
    'Universidad'
  );
  if (!universidad) {
    throw new Error('Universidad requerida.');
  }

  const materia = aTextoLimitado(item.materia ?? '', LIMITES_DOCENCIA.materia, 'Materia');
  if (!materia) {
    throw new Error('Materia requerida.');
  }

  const horas = Number(item.horasSemanales);
  if (!Number.isInteger(horas) || horas <= 0) {
    throw new Error('Las horas semanales deben ser un entero mayor que 0.');
  }

  const fechaInicio = item.fechaInicio?.trim().slice(0, 10) ?? '';
  const fechaFin = item.fechaFin?.trim().slice(0, 10) ?? '';
  if (!fechaInicio || !fechaFin) {
    throw new Error('Fecha de inicio y fecha de fin requeridas.');
  }
  if (fechaFin < fechaInicio) {
    throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
  }

  const especialidad = aTextoLimitado(
    item.especialidad ?? '',
    LIMITES_DOCENCIA.especialidad,
    'Especialidad'
  );
  const categoria = aTextoLimitado(
    item.categoria ?? '',
    LIMITES_DOCENCIA.categoria,
    'Categoría'
  );
  const condicion = aTextoLimitado(
    item.condicion ?? '',
    LIMITES_DOCENCIA.condicion,
    'Condición'
  );

  const body: GuardarDocenciaRequestDto = {
    rubroId,
    descripcionDocumento,
    universidad,
    horasSemanales: horas,
    fechaInicio,
    fechaFin,
    ordenJuridico: aOrdenJuridico(item.ordenJuridico),
    especialidad: especialidad || null,
    materia,
    categoria: categoria || null,
    condicion: condicion || null,
    archivoId: item.archivoId ? aNumeroId(item.archivoId, 'Archivo') : null,
  };

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}

export function aplicarDocenciaEnFicha(
  ficha: FichaValoracion,
  item: DocenciaUniversitaria,
  respuesta: DocenciaDetalleDto
): FichaValoracion {
  const rubro = ficha.rubroDocencia ?? crearRubroDocenciaVacio();
  const guardado = aDocenciaDesdeDto(respuesta);
  const sinAnterior = rubro.items.filter(
    (actual) => actual.id !== item.id && actual.id !== guardado.id
  );

  return {
    ...ficha,
    rubroDocencia: {
      items: [...sinAnterior, guardado],
      puntajeTotal: rubro.puntajeTotal,
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function reemplazarDocenciasEnFicha(
  ficha: FichaValoracion,
  detalle: DocenciaDetalleDto[]
): FichaValoracion {
  const rubro = ficha.rubroDocencia ?? crearRubroDocenciaVacio();
  return {
    ...ficha,
    rubroDocencia: {
      items: detalle.map((dto) => aDocenciaDesdeDto(dto)),
      puntajeTotal: rubro.puntajeTotal,
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function eliminarDocenciaEnFicha(
  ficha: FichaValoracion,
  itemId: string
): FichaValoracion {
  const rubro = ficha.rubroDocencia ?? crearRubroDocenciaVacio();
  return {
    ...ficha,
    rubroDocencia: {
      items: rubro.items.filter((item) => item.id !== itemId),
      puntajeTotal: rubro.puntajeTotal,
    },
    actualizadoEn: new Date().toISOString(),
  };
}
