import {
  CertamenAcademico,
  JuridicoCertamen,
  LIMITE_TEMA_CERTAMEN,
  ordenarCertamenesAcademicos,
  puntajeSubrubroCertamenesAcademicos,
  RubroCertamenesAcademicos,
  TOPE_PUNTAJE_CERTAMENES_ACADEMICOS,
} from '../../domain/models/rubro-certamenes-academicos.model';
import {
  CertamenAcademicoDetalleDto,
  GuardarCertamenAcademicoRequestDto,
  ObtenerCertamenesAcademicosDataDto,
} from '../dto/remote/FichaCertamenesAcademicosResponse.dto';

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

function aJuridico(valor: string): JuridicoCertamen {
  const texto = String(valor ?? '').trim();
  if (texto === '1' || texto === '0') {
    return texto;
  }
  throw new Error('Indique si el certamen es jurídico.');
}

function aTema(valor: string): string {
  const texto = String(valor ?? '').trim();
  if (!texto) {
    throw new Error('El tema es obligatorio.');
  }
  if (texto.length > LIMITE_TEMA_CERTAMEN) {
    throw new Error(`El tema supera los ${LIMITE_TEMA_CERTAMEN} caracteres.`);
  }
  return texto;
}

function aArchivoId(valor: string | null): number | null {
  if (valor == null || String(valor).trim() === '') {
    return null;
  }
  return aNumeroId(String(valor), 'Archivo');
}

function aCertamenDesdeDto(dto: CertamenAcademicoDetalleDto): CertamenAcademico {
  if (dto.idCertamenAcademico == null) {
    throw new Error('Certamen recibido sin identificador.');
  }

  const puntaje = Number(dto.puntaje);
  const archivoId = dto.archivoId == null ? null : String(dto.archivoId);

  return {
    id: String(dto.idCertamenAcademico),
    eventoId: String(dto.eventoId),
    eventoDescripcion: dto.eventoDescripcion?.trim() ?? '',
    tipoParticipacionId: String(dto.tipoParticipacionId),
    tipoParticipacionDescripcion: dto.tipoParticipacionDescripcion?.trim() ?? '',
    institucionId: String(dto.institucionId),
    institucionNombre: dto.institucionNombre?.trim() ?? '',
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
    archivoId,
    puntaje: Number.isFinite(puntaje) ? puntaje : 0,
  };
}

function normalizarListaDetalle(
  data: ObtenerCertamenesAcademicosDataDto | CertamenAcademicoDetalleDto[] | null | undefined
): CertamenAcademicoDetalleDto[] {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  return data.certamenesAcademicos ?? [];
}

function puntajeDeLista(
  data: ObtenerCertamenesAcademicosDataDto | CertamenAcademicoDetalleDto[] | null | undefined,
  items: CertamenAcademico[]
): number {
  const api = !Array.isArray(data) && data?.puntajeTotal != null ? Number(data.puntajeTotal) : NaN;
  if (Number.isFinite(api)) {
    return Math.min(TOPE_PUNTAJE_CERTAMENES_ACADEMICOS, api);
  }
  return puntajeSubrubroCertamenesAcademicos(items);
}

export function toRubroCertamenesAcademicosDesdeDetalle(
  data: ObtenerCertamenesAcademicosDataDto | CertamenAcademicoDetalleDto[] | null | undefined
): RubroCertamenesAcademicos {
  const items = ordenarCertamenesAcademicos(
    normalizarListaDetalle(data).map((dto) => aCertamenDesdeDto(dto))
  );
  return {
    items,
    puntajeTotal: puntajeDeLista(data, items),
  };
}

export function toGuardarCertamenAcademicoRequestDto(
  fichaId: string,
  item: CertamenAcademico,
  rubroId: number,
  incluirFicha: boolean
): GuardarCertamenAcademicoRequestDto {
  if (!Number.isFinite(rubroId) || rubroId <= 0) {
    throw new Error('Rubro no válido.');
  }

  const fechaInicio = aFecha(item.fechaInicio, 'Fecha de inicio');
  const fechaFin = aFecha(item.fechaFin, 'Fecha de fin');
  if (fechaFin < fechaInicio) {
    throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
  }

  const body: GuardarCertamenAcademicoRequestDto = {
    rubroId,
    eventoId: aNumeroId(item.eventoId, 'Tipo de certamen'),
    tipoParticipacionId: aNumeroId(item.tipoParticipacionId, 'Participación'),
    institucionId: aNumeroId(item.institucionId, 'Institución'),
    paisId: aNumeroId(item.paisId, 'País'),
    fechaInicio,
    fechaFin,
    juridico: aJuridico(item.juridico),
    especialidadId: aNumeroId(item.especialidadId, 'Especialidad'),
    tema: aTema(item.tema),
    modalidadId: aNumeroId(item.modalidadId, 'Modalidad'),
    archivoId: aArchivoId(item.archivoId),
  };

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}

