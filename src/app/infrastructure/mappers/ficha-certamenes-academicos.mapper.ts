import { FichaValoracion } from '../../domain/models/ficha-valoracion.model';
import {
  CertamenAcademico,
  crearRubroCertamenesAcademicosVacio,
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

export function toRubroCertamenesAcademicosDesdeDetalle(
  data: CertamenAcademicoDetalleDto[] | null | undefined,
  puntajeOficial?: number | null
): RubroCertamenesAcademicos {
  const items = ordenarCertamenesAcademicos((data ?? []).map((dto) => aCertamenDesdeDto(dto)));
  const local = puntajeSubrubroCertamenesAcademicos(items);
  const oficial =
    puntajeOficial != null && Number.isFinite(puntajeOficial) && puntajeOficial > 0
      ? Math.min(TOPE_PUNTAJE_CERTAMENES_ACADEMICOS, puntajeOficial)
      : local;

  return {
    items,
    puntajeTotal: oficial,
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

export function aplicarCertamenAcademicoEnFicha(
  ficha: FichaValoracion,
  item: CertamenAcademico,
  respuesta: CertamenAcademicoDetalleDto
): FichaValoracion {
  const rubro = ficha.rubroCertamenesAcademicos ?? crearRubroCertamenesAcademicosVacio();
  const guardada = aCertamenDesdeDto(respuesta);
  const conTextos: CertamenAcademico = {
    ...guardada,
    eventoDescripcion: guardada.eventoDescripcion || item.eventoDescripcion,
    tipoParticipacionDescripcion:
      guardada.tipoParticipacionDescripcion || item.tipoParticipacionDescripcion,
    institucionNombre: guardada.institucionNombre || item.institucionNombre,
    nombrePais: guardada.nombrePais || item.nombrePais,
    especialidadDescripcion: guardada.especialidadDescripcion || item.especialidadDescripcion,
    modalidadDescripcion: guardada.modalidadDescripcion || item.modalidadDescripcion,
  };
  const sinAnterior = rubro.items.filter(
    (actual) => actual.id !== item.id && actual.id !== conTextos.id
  );

  return {
    ...ficha,
    rubroCertamenesAcademicos: {
      items: ordenarCertamenesAcademicos([...sinAnterior, conTextos]),
      puntajeTotal: rubro.puntajeTotal,
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function eliminarCertamenAcademicoEnFicha(
  ficha: FichaValoracion,
  itemId: string
): FichaValoracion {
  const rubro = ficha.rubroCertamenesAcademicos ?? crearRubroCertamenesAcademicosVacio();
  const items = rubro.items.filter((item) => item.id !== itemId);
  return {
    ...ficha,
    rubroCertamenesAcademicos: {
      items,
      puntajeTotal: puntajeSubrubroCertamenesAcademicos(items),
    },
    actualizadoEn: new Date().toISOString(),
  };
}
