import {
  JuridicoPasantia,
  LIMITE_MENCION_PASANTIA,
  ordenarPasantias,
  Pasantia,
  puntajeSubrubroPasantias,
  RubroPasantias,
  TOPE_PUNTAJE_PASANTIAS,
} from '../../domain/models/rubro-pasantias.model';
import {
  GuardarPasantiaRequestDto,
  ObtenerPasantiasDataDto,
  PasantiaDetalleDto,
} from '../dto/remote/FichaPasantiasResponse.dto';

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

function aJuridico(valor: string): JuridicoPasantia {
  const texto = String(valor ?? '').trim();
  if (texto === '1' || texto === '0') {
    return texto;
  }
  throw new Error('Jurídico debe ser Sí o No.');
}

function aMencion(valor: string): string {
  const texto = String(valor ?? '').trim();
  if (texto.length > LIMITE_MENCION_PASANTIA) {
    throw new Error(`La mención supera los ${LIMITE_MENCION_PASANTIA} caracteres.`);
  }
  return texto;
}

function aArchivoId(valor: string | null): number | null {
  if (valor == null || String(valor).trim() === '') {
    return null;
  }
  return aNumeroId(String(valor), 'Archivo');
}

function aPasantiaDesdeDto(dto: PasantiaDetalleDto): Pasantia {
  if (dto.idPasantia == null) {
    throw new Error('Pasantía recibida sin identificador.');
  }

  const puntaje = Number(dto.puntaje);
  const archivoId = dto.archivoId == null ? null : String(dto.archivoId);

  return {
    id: String(dto.idPasantia),
    tipoPasantiaId: String(dto.tipoPasantiaId),
    tipoPasantiaDescripcion: dto.tipoPasantiaDescripcion?.trim() ?? '',
    institucionId: String(dto.institucionId),
    institucionNombre: dto.institucionNombre?.trim() ?? '',
    paisId: String(dto.paisId),
    paisNombre: dto.paisNombre?.trim() ?? '',
    fechaInicio: aFecha(dto.fechaInicio, 'Fecha de inicio'),
    fechaFin: aFecha(dto.fechaFin, 'Fecha de fin'),
    juridico: aJuridico(dto.juridico),
    especialidadId: String(dto.especialidadId),
    especialidadDescripcion: dto.especialidadDescripcion?.trim() ?? '',
    mencion: dto.mencion?.trim() ?? '',
    archivoId,
    puntaje: Number.isFinite(puntaje) ? puntaje : 0,
  };
}

function normalizarListaDetalle(
  data: ObtenerPasantiasDataDto | PasantiaDetalleDto[] | null | undefined
): PasantiaDetalleDto[] {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  return data.pasantias ?? [];
}

function puntajeDeLista(
  data: ObtenerPasantiasDataDto | PasantiaDetalleDto[] | null | undefined,
  items: Pasantia[]
): number {
  const api = !Array.isArray(data) && data?.puntajeTotal != null ? Number(data.puntajeTotal) : NaN;
  if (Number.isFinite(api)) {
    return Math.min(TOPE_PUNTAJE_PASANTIAS, api);
  }
  return puntajeSubrubroPasantias(items);
}

export function toRubroPasantiasDesdeDetalle(
  data: ObtenerPasantiasDataDto | PasantiaDetalleDto[] | null | undefined
): RubroPasantias {
  const items = ordenarPasantias(normalizarListaDetalle(data).map((dto) => aPasantiaDesdeDto(dto)));
  return {
    items,
    puntajeTotal: puntajeDeLista(data, items),
  };
}

export function toGuardarPasantiaRequestDto(
  fichaId: string,
  item: Pasantia,
  rubroId: number,
  incluirFicha: boolean
): GuardarPasantiaRequestDto {
  if (!Number.isFinite(rubroId) || rubroId <= 0) {
    throw new Error('Rubro no válido.');
  }

  const fechaInicio = aFecha(item.fechaInicio, 'Fecha de inicio');
  const fechaFin = aFecha(item.fechaFin, 'Fecha de fin');
  if (fechaFin < fechaInicio) {
    throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
  }

  const body: GuardarPasantiaRequestDto = {
    rubroId,
    tipoPasantiaId: aNumeroId(item.tipoPasantiaId, 'Tipo de pasantía'),
    institucionId: aNumeroId(item.institucionId, 'Institución'),
    paisId: aNumeroId(item.paisId, 'País'),
    fechaInicio,
    fechaFin,
    juridico: aJuridico(item.juridico),
    especialidadId: aNumeroId(item.especialidadId, 'Especialidad'),
    mencion: aMencion(item.mencion),
    archivoId: aArchivoId(item.archivoId),
  };

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}

