import {
  AsistenciaEventoAcademico,
  JuridicoAsistenciaEvento,
  LIMITE_TEMA_ASISTENCIA_EVENTO,
  ordenarAsistenciasEventos,
  puntajeSubrubroAsistenciasEventos,
  RubroAsistenciasEventos,
  TOPE_PUNTAJE_ASISTENCIAS_EVENTOS,
} from '../../domain/models/rubro-asistencias-eventos.model';
import {
  AsistenciaEventoDetalleDto,
  GuardarAsistenciaEventoRequestDto,
  ObtenerAsistenciasEventosDataDto,
} from '../dto/remote/FichaAsistenciasEventosResponse.dto';

function aNumeroId(valor: string, etiqueta: string): number {
  const n = Number(String(valor ?? '').trim());
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`${etiqueta} no válido.`);
  }
  return n;
}

function aFecha(valor: string, etiqueta: string): string {
  const texto = String(valor ?? '').trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    throw new Error(`${etiqueta} no válida.`);
  }
  return texto;
}

function aJuridico(valor: string): JuridicoAsistenciaEvento {
  const texto = String(valor ?? '').trim();
  if (texto === '1' || texto === '0') {
    return texto;
  }
  throw new Error('Indique si el evento es jurídico.');
}

function aTema(valor: string): string {
  const texto = String(valor ?? '').trim();
  if (!texto) {
    throw new Error('El tema es obligatorio.');
  }
  if (texto.length > LIMITE_TEMA_ASISTENCIA_EVENTO) {
    throw new Error(`El tema supera los ${LIMITE_TEMA_ASISTENCIA_EVENTO} caracteres.`);
  }
  return texto;
}

function aArchivoId(valor: string | null): number | null {
  if (valor == null || String(valor).trim() === '') {
    return null;
  }
  return aNumeroId(String(valor), 'Archivo');
}

function aAsistenciaDesdeDto(dto: AsistenciaEventoDetalleDto): AsistenciaEventoAcademico {
  if (dto.idAsistenciaEvento == null) {
    throw new Error('Asistencia recibida sin identificador.');
  }

  const puntaje = Number(dto.puntaje);
  const archivoId = dto.archivoId == null ? null : String(dto.archivoId);
  const institucionNombre = String(dto.institucion ?? dto.institucionNombre ?? '').trim();

  return {
    id: String(dto.idAsistenciaEvento),
    eventoId: String(dto.eventoId),
    eventoDescripcion: dto.eventoDescripcion?.trim() ?? '',
    institucionId: String(dto.institucionId),
    institucionNombre,
    paisId: String(dto.paisId),
    nombrePais: dto.nombrePais?.trim() ?? '',
    fechaInicio: aFecha(dto.fechaInicio, 'Fecha de inicio'),
    fechaFin: aFecha(dto.fechaFin, 'Fecha de fin'),
    juridico: aJuridico(dto.juridico),
    especialidadId: String(dto.especialidadId),
    especialidadDescripcion: dto.especialidadDescripcion?.trim() ?? '',
    tema: aTema(dto.tema),
    modalidadId: String(dto.modalidadId),
    modalidadDescripcion: dto.modalidadDescripcion?.trim() ?? '',
    tipoDocumentoId: String(dto.tipoDocumentoId),
    tipoDocumentoDescripcion: dto.tipoDocumentoDescripcion?.trim() ?? '',
    archivoId,
    puntaje: Number.isFinite(puntaje) ? puntaje : 0,
  };
}

function normalizarListaDetalle(
  data: ObtenerAsistenciasEventosDataDto | AsistenciaEventoDetalleDto[] | null | undefined
): AsistenciaEventoDetalleDto[] {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  return data.asistenciasEventos ?? [];
}

function puntajeDeLista(
  data: ObtenerAsistenciasEventosDataDto | AsistenciaEventoDetalleDto[] | null | undefined,
  items: AsistenciaEventoAcademico[]
): number {
  const api = !Array.isArray(data) && data?.puntajeTotal != null ? Number(data.puntajeTotal) : NaN;
  if (Number.isFinite(api)) {
    return Math.min(TOPE_PUNTAJE_ASISTENCIAS_EVENTOS, api);
  }
  return puntajeSubrubroAsistenciasEventos(items);
}

export function toRubroAsistenciasEventosDesdeDetalle(
  data: ObtenerAsistenciasEventosDataDto | AsistenciaEventoDetalleDto[] | null | undefined
): RubroAsistenciasEventos {
  const items = ordenarAsistenciasEventos(
    normalizarListaDetalle(data).map((dto) => aAsistenciaDesdeDto(dto))
  );
  return {
    items,
    puntajeTotal: puntajeDeLista(data, items),
  };
}

export function toGuardarAsistenciaEventoRequestDto(
  fichaId: string,
  item: AsistenciaEventoAcademico,
  rubroId: number,
  incluirFicha: boolean
): GuardarAsistenciaEventoRequestDto {
  if (!Number.isFinite(rubroId) || rubroId <= 0) {
    throw new Error('Rubro no válido.');
  }

  const fechaInicio = aFecha(item.fechaInicio, 'Fecha de inicio');
  const fechaFin = aFecha(item.fechaFin, 'Fecha de fin');
  if (fechaFin < fechaInicio) {
    throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
  }

  const body: GuardarAsistenciaEventoRequestDto = {
    rubroId,
    eventoId: aNumeroId(item.eventoId, 'Tipo de evento'),
    institucionId: aNumeroId(item.institucionId, 'Institución'),
    paisId: aNumeroId(item.paisId, 'País'),
    fechaInicio,
    fechaFin,
    juridico: aJuridico(item.juridico),
    especialidadId: aNumeroId(item.especialidadId, 'Especialidad'),
    tema: aTema(item.tema),
    modalidadId: aNumeroId(item.modalidadId, 'Modalidad'),
    tipoDocumentoId: aNumeroId(item.tipoDocumentoId, 'Tipo de documento'),
    archivoId: aArchivoId(item.archivoId),
  };

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}

