import { FichaValoracion } from '../../domain/models/ficha-valoracion.model';
import {
  crearRubroPasantiasVacio,
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

export function toRubroPasantiasDesdeDetalle(
  data: PasantiaDetalleDto[] | null | undefined,
  puntajeOficial?: number | null
): RubroPasantias {
  const items = ordenarPasantias((data ?? []).map((dto) => aPasantiaDesdeDto(dto)));
  const local = puntajeSubrubroPasantias(items);
  const oficial =
    puntajeOficial != null && Number.isFinite(puntajeOficial) && puntajeOficial > 0
      ? Math.min(TOPE_PUNTAJE_PASANTIAS, puntajeOficial)
      : local;

  return {
    items,
    puntajeTotal: oficial,
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

export function aplicarPasantiaEnFicha(
  ficha: FichaValoracion,
  item: Pasantia,
  respuesta: PasantiaDetalleDto
): FichaValoracion {
  const rubro = ficha.rubroPasantias ?? crearRubroPasantiasVacio();
  const guardada = aPasantiaDesdeDto(respuesta);
  const conTextos: Pasantia = {
    ...guardada,
    tipoPasantiaDescripcion:
      guardada.tipoPasantiaDescripcion || item.tipoPasantiaDescripcion,
    institucionNombre: guardada.institucionNombre || item.institucionNombre,
    paisNombre: guardada.paisNombre || item.paisNombre,
    especialidadDescripcion:
      guardada.especialidadDescripcion || item.especialidadDescripcion,
  };
  const sinAnterior = rubro.items.filter(
    (actual) => actual.id !== item.id && actual.id !== conTextos.id
  );

  return {
    ...ficha,
    rubroPasantias: {
      items: ordenarPasantias([...sinAnterior, conTextos]),
      puntajeTotal: rubro.puntajeTotal,
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function eliminarPasantiaEnFicha(ficha: FichaValoracion, itemId: string): FichaValoracion {
  const rubro = ficha.rubroPasantias ?? crearRubroPasantiasVacio();
  const items = rubro.items.filter((item) => item.id !== itemId);
  return {
    ...ficha,
    rubroPasantias: {
      items,
      puntajeTotal: puntajeSubrubroPasantias(items),
    },
    actualizadoEn: new Date().toISOString(),
  };
}
