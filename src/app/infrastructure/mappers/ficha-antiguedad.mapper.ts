import {
  crearRubroAntiguedadVacio,
  FichaValoracion,
} from '../../domain/models/ficha-valoracion.model';
import {
  Colegiatura,
  PeriodoNivelAnterior,
  Provisionalidad,
  RubroAntiguedad,
  TitularidadActual,
} from '../../domain/models/rubro-antiguedad.model';
import {
  TiempoServicio,
  TIEMPO_SERVICIO_CERO,
} from '../../domain/models/tiempo-servicio.model';
import {
  GuardarColegiaturaDataDto,
  GuardarColegiaturaRequestDto,
  GuardarPeriodoInmediatoDataDto,
  GuardarPeriodoInmediatoRequestDto,
  GuardarProvisionalidadDataDto,
  GuardarProvisionalidadRequestDto,
  GuardarTitularidadDataDto,
  GuardarTitularidadRequestDto,
} from '../dto/remote/FichaAntiguedadResponse.dto';

export function aTiempoServicioDesdePartes(
  anios: number | null | undefined,
  meses: number | null | undefined,
  dias: number | null | undefined
): TiempoServicio {
  const a = Number(anios) || 0;
  const m = Number(meses) || 0;
  const d = Number(dias) || 0;
  return {
    anios: a,
    meses: m,
    dias: d,
    etiqueta: `${a} aa ${m} mm ${d} dd`,
  };
}

function aNumeroId(valor: string, etiqueta: string): number {
  const n = Number(String(valor ?? '').trim());
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${etiqueta} no válido.`);
  }
  return n;
}

function aNumeroIdOpcional(valor: string | null | undefined): number | null {
  const crudo = String(valor ?? '').trim();
  if (!crudo) {
    return null;
  }
  const n = Number(crudo);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function normalizarHora(hora: string): string {
  const h = hora.trim();
  if (/^\d{2}:\d{2}$/.test(h)) {
    return h;
  }
  if (/^\d{2}:\d{2}:\d{2}$/.test(h)) {
    return h.slice(0, 5);
  }
  return h;
}

export function toGuardarTitularidadRequestDto(
  fichaId: string,
  data: TitularidadActual
): GuardarTitularidadRequestDto {
  if (!data.fechaJuramentacion?.trim()) {
    throw new Error('Fecha de juramentación requerida.');
  }
  if (!data.horaJuramento?.trim()) {
    throw new Error('Hora de juramentación requerida.');
  }

  return {
    distritoJudicialId: aNumeroId(data.distritoJudicialId, 'Distrito judicial'),
    cargoMagistradoId: aNumeroId(data.cargoTitularId, 'Cargo de magistrado'),
    fechaJuramentacion: data.fechaJuramentacion.trim().slice(0, 10),
    horaJuramentacion: normalizarHora(data.horaJuramento),
    fechaCese: data.fechaCese?.trim() ? data.fechaCese.trim().slice(0, 10) : null,
    fechaReincorporacion: data.fechaReincorporacion?.trim()
      ? data.fechaReincorporacion.trim().slice(0, 10)
      : null,
    primeraEspecialidadId: aNumeroId(data.primeraEspecialidadId, 'Primera especialidad'),
    segundaEspecialidadId: aNumeroIdOpcional(data.segundaEspecialidadId),
    fichaValoracionId: aNumeroId(fichaId, 'Ficha de valoración'),
  };
}

export function toGuardarPeriodoInmediatoRequestDto(
  cargoAntiguedadId: string,
  data: PeriodoNivelAnterior
): GuardarPeriodoInmediatoRequestDto {
  if (!data.fechaInicio?.trim() || !data.fechaFin?.trim()) {
    throw new Error('Indique fecha inicio y fecha fin del periodo.');
  }

  return {
    cargoAntiguedadId: aNumeroId(cargoAntiguedadId, 'Antigüedad'),
    nivelMagistradoAnteriorId: aNumeroId(
      data.nivelInmediatoAnteriorId,
      'Nivel inmediato anterior'
    ),
    fechaInicio: data.fechaInicio.trim().slice(0, 10),
    fechaFin: data.fechaFin.trim().slice(0, 10),
  };
}

export function toGuardarProvisionalidadRequestDto(
  cargoAntiguedadId: string,
  item: Provisionalidad
): GuardarProvisionalidadRequestDto {
  return {
    cargoAntiguedadId: aNumeroId(cargoAntiguedadId, 'Antigüedad'),
    nivelMagistradoProvisionalId: aNumeroId(item.cargoId, 'Cargo provisional'),
    fechaInicio: item.fechaInicio.trim().slice(0, 10),
    fechaFin: item.fechaFin.trim().slice(0, 10),
    documentoSustentatorio: item.documento.trim(),
    organoJurisdiccional: item.organoJurisdiccional.trim(),
  };
}

export function toGuardarColegiaturaRequestDto(
  cargoAntiguedadId: string,
  item: Colegiatura
): GuardarColegiaturaRequestDto {
  return {
    cargoAntiguedadId: aNumeroId(cargoAntiguedadId, 'Antigüedad'),
    colegioProfesionalId: aNumeroId(item.colegioId, 'Colegio profesional'),
    fechaInicio: item.fechaColegiatura.trim().slice(0, 10),
  };
}

export function aplicarTitularidadEnFicha(
  ficha: FichaValoracion,
  data: TitularidadActual,
  respuesta: GuardarTitularidadDataDto
): FichaValoracion {
  const rubro = ficha.rubroAntiguedad ?? crearRubroAntiguedadVacio();
  const tiempo = aTiempoServicioDesdePartes(respuesta.anios, respuesta.meses, respuesta.dias);
  const puntaje = Number(respuesta.puntaje) || 0;

  const actualizado: RubroAntiguedad = {
    ...rubro,
    id: String(respuesta.idFichaAntiguedad),
    titularidad: {
      ...data,
      distritoJudicialId: String(respuesta.idDistritoJudicial ?? data.distritoJudicialId),
      cargoTitularId: String(respuesta.idCargoMagistrado ?? data.cargoTitularId),
      fechaJuramentacion: respuesta.fechaJuramentacion ?? data.fechaJuramentacion,
      horaJuramento: (respuesta.horaJuramentacion ?? data.horaJuramento)?.slice(0, 5) ?? null,
      fechaCese: respuesta.fechaCese ?? data.fechaCese,
      fechaReincorporacion: respuesta.fechaReincorporacion ?? data.fechaReincorporacion,
      primeraEspecialidadId: String(
        respuesta.idPrimeraEspecialidad ?? data.primeraEspecialidadId
      ),
      segundaEspecialidadId:
        respuesta.idSegundaEspecialidad != null
          ? String(respuesta.idSegundaEspecialidad)
          : data.segundaEspecialidadId,
      tiempoTotal: tiempo,
      puntaje,
    },
  };

  return {
    ...ficha,
    rubroAntiguedad: actualizado,
    puntajeTotal: puntaje,
    actualizadoEn: new Date().toISOString(),
  };
}

export function aplicarPeriodoEnFicha(
  ficha: FichaValoracion,
  data: PeriodoNivelAnterior,
  respuesta: GuardarPeriodoInmediatoDataDto
): FichaValoracion {
  const rubro = ficha.rubroAntiguedad ?? crearRubroAntiguedadVacio();
  const tiempo = aTiempoServicioDesdePartes(respuesta.anios, respuesta.meses, respuesta.dias);

  return {
    ...ficha,
    rubroAntiguedad: {
      ...rubro,
      id: rubro.id ?? String(respuesta.cargoAntiguedadId),
      periodoNivelAnterior: {
        ...data,
        nivelInmediatoAnteriorId: String(
          respuesta.nivelMagistradoAnteriorId ?? data.nivelInmediatoAnteriorId
        ),
        fechaInicio: respuesta.fechaInicio ?? data.fechaInicio,
        fechaFin: respuesta.fechaFin ?? data.fechaFin,
        tiempoTotal: tiempo,
      },
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function aplicarProvisionalidadEnFicha(
  ficha: FichaValoracion,
  item: Provisionalidad,
  respuesta: GuardarProvisionalidadDataDto
): FichaValoracion {
  const rubro = ficha.rubroAntiguedad ?? crearRubroAntiguedadVacio();
  const tiempo = aTiempoServicioDesdePartes(respuesta.anios, respuesta.meses, respuesta.dias);
  const guardada: Provisionalidad = {
    ...item,
    id: String(respuesta.idProvisionalidad),
    cargoId: String(respuesta.nivelMagistradoProvisionalId ?? item.cargoId),
    fechaInicio: respuesta.fechaInicio ?? item.fechaInicio,
    fechaFin: respuesta.fechaFin ?? item.fechaFin,
    documento: respuesta.documentoSustentatorio ?? item.documento,
    organoJurisdiccional: respuesta.organoJurisdiccional ?? item.organoJurisdiccional,
    tiempoTotal: tiempo,
  };

  const sinAnterior = rubro.provisionalidades.filter((p) => p.id !== item.id && p.id !== guardada.id);
  const provisionalidades = [...sinAnterior, guardada];
  const suma = sumarTiemposLocal(provisionalidades.map((p) => p.tiempoTotal));

  return {
    ...ficha,
    rubroAntiguedad: {
      ...rubro,
      id: rubro.id ?? String(respuesta.cargoAntiguedadId),
      provisionalidades,
      sumaProvisionalidades: suma,
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function aplicarColegiaturaEnFicha(
  ficha: FichaValoracion,
  item: Colegiatura,
  respuesta: GuardarColegiaturaDataDto
): FichaValoracion {
  const rubro = ficha.rubroAntiguedad ?? crearRubroAntiguedadVacio();
  const guardada: Colegiatura = {
    ...item,
    id: String(respuesta.idColegiatura),
    colegioId: String(respuesta.colegioProfesionalId ?? item.colegioId),
    fechaColegiatura: respuesta.fechaInicio ?? item.fechaColegiatura,
    anios: Number(respuesta.anios) || item.anios,
  };

  const sinAnterior = rubro.colegiaturas.filter((c) => c.id !== item.id && c.id !== guardada.id);

  return {
    ...ficha,
    rubroAntiguedad: {
      ...rubro,
      id: rubro.id ?? String(respuesta.cargoAntiguedadId),
      colegiaturas: [...sinAnterior, guardada],
    },
    actualizadoEn: new Date().toISOString(),
  };
}

function sumarTiemposLocal(tiempos: TiempoServicio[]): TiempoServicio {
  if (tiempos.length === 0) {
    return TIEMPO_SERVICIO_CERO;
  }

  let totalDias = 0;
  for (const t of tiempos) {
    totalDias += t.anios * 360 + t.meses * 30 + t.dias;
  }

  const anios = Math.floor(totalDias / 360);
  const resto = totalDias % 360;
  const meses = Math.floor(resto / 30);
  const dias = resto % 30;
  return aTiempoServicioDesdePartes(anios, meses, dias);
}
