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
import { TiempoServicio } from '../../domain/models/tiempo-servicio.model';
import {
  GuardarColegiaturaRequestDto,
  GuardarPeriodoInmediatoDataDto,
  GuardarPeriodoInmediatoRequestDto,
  GuardarProvisionalidadRequestDto,
  GuardarTitularidadDataDto,
  GuardarTitularidadRequestDto,
  ObtenerAntiguedadDataDto,
  ObtenerColegiaturasDataDto,
  ObtenerProvisionalidadesDataDto,
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

export function esIdPersistidoApi(id: string | null | undefined): boolean {
  const crudo = String(id ?? '').trim();
  return /^\d+$/.test(crudo);
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
  idFichaAntiguedad: string,
  data: PeriodoNivelAnterior
): GuardarPeriodoInmediatoRequestDto {
  if (!data.fechaInicio?.trim() || !data.fechaFin?.trim()) {
    throw new Error('Indique fecha inicio y fecha fin del periodo.');
  }

  return {
    idFichaAntiguedad: aNumeroId(idFichaAntiguedad, 'Antigüedad'),
    nivelMagistradoAnteriorId: aNumeroId(
      data.nivelInmediatoAnteriorId,
      'Nivel inmediato anterior'
    ),
    fechaInicio: data.fechaInicio.trim().slice(0, 10),
    fechaFin: data.fechaFin.trim().slice(0, 10),
  };
}

export function toGuardarProvisionalidadRequestDto(
  idFichaAntiguedad: string,
  item: Provisionalidad
): GuardarProvisionalidadRequestDto {
  return {
    idFichaAntiguedad: aNumeroId(idFichaAntiguedad, 'Antigüedad'),
    nivelMagistradoProvisionalId: aNumeroId(item.cargoId, 'Cargo provisional'),
    fechaInicio: item.fechaInicio.trim().slice(0, 10),
    fechaFin: item.fechaFin?.trim() ? item.fechaFin.trim().slice(0, 10) : null,
    documentoSustentatorio: item.documento?.trim() || null,
    organoJurisdiccional: item.organoJurisdiccional?.trim() || null,
  };
}

export function toGuardarColegiaturaRequestDto(
  idFichaAntiguedad: string,
  item: Colegiatura
): GuardarColegiaturaRequestDto {
  return {
    idFichaAntiguedad: aNumeroId(idFichaAntiguedad, 'Antigüedad'),
    colegioProfesionalId: aNumeroId(item.colegioId, 'Colegio profesional'),
    fechaInicio: item.fechaColegiatura.trim().slice(0, 10),
  };
}

export function toRubroAntiguedadDesdeDetalle(data: ObtenerAntiguedadDataDto): RubroAntiguedad {
  const base = crearRubroAntiguedadVacio();
  const antiguedad = data.antiguedad;

  if (!antiguedad) {
    return base;
  }

  const periodo = data.periodoInmediato;

  return {
    id: String(antiguedad.idFichaAntiguedad),
    titularidad: {
      distritoJudicialId: String(antiguedad.idDistritoJudicial),
      cargoTitularId: String(antiguedad.idCargoMagistrado),
      fechaJuramentacion: antiguedad.fechaJuramentacion,
      horaJuramento: normalizarHora(antiguedad.horaJuramentacion),
      fechaCese: antiguedad.fechaCese,
      fechaReincorporacion: antiguedad.fechaReincorporacion,
      fechaValoracion: null,
      tiempoTotal: aTiempoServicioDesdePartes(
        antiguedad.anios,
        antiguedad.meses,
        antiguedad.dias
      ),
      puntaje: Number(antiguedad.puntaje) || 0,
      primeraEspecialidadId: String(antiguedad.idPrimeraEspecialidad),
      segundaEspecialidadId:
        antiguedad.idSegundaEspecialidad != null
          ? String(antiguedad.idSegundaEspecialidad)
          : '',
    },
    periodoNivelAnterior: periodo
      ? {
          id: String(periodo.idPeriodoInmediato),
          nivelInmediatoAnteriorId: String(periodo.nivelMagistradoAnteriorId),
          fechaInicio: periodo.fechaInicio,
          fechaFin: periodo.fechaFin,
          tiempoTotal: aTiempoServicioDesdePartes(periodo.anios, periodo.meses, periodo.dias),
        }
      : base.periodoNivelAnterior,
    provisionalidades: base.provisionalidades,
    sumaProvisionalidades: base.sumaProvisionalidades,
    colegiaturas: base.colegiaturas,
  };
}

/** `GET fichas-antiguedad/provisionalidad`: filas vigentes y suma calculada por el servidor. */
export function toProvisionalidadesDesdeDetalle(
  data: ObtenerProvisionalidadesDataDto | null | undefined
): Pick<RubroAntiguedad, 'provisionalidades' | 'sumaProvisionalidades'> {
  const provisionalidades: Provisionalidad[] = (data?.provisionalidades ?? []).map((item) => ({
    id: String(item.idProvisionalidad),
    fechaInicio: item.fechaInicio,
    fechaFin: item.fechaFin ?? '',
    tiempoTotal: aTiempoServicioDesdePartes(item.anios, item.meses, item.dias),
    cargoId: String(item.nivelMagistradoProvisionalId),
    cargoNombre: item.nivelMagistradoProvisionalDescripcion?.trim() ?? '',
    organoJurisdiccional: item.organoJurisdiccional ?? '',
    documento: item.documentoSustentatorio ?? '',
  }));

  return {
    provisionalidades,
    sumaProvisionalidades: aTiempoServicioDesdePartes(
      data?.suma?.anios,
      data?.suma?.meses,
      data?.suma?.dias
    ),
  };
}

/** `GET fichas-antiguedad/colegiatura`: filas vigentes con años calculados por el servidor. */
export function toColegiaturasDesdeDetalle(
  data: ObtenerColegiaturasDataDto | null | undefined
): Colegiatura[] {
  return (data?.colegiaturas ?? []).map((item) => ({
    id: String(item.idColegiatura),
    colegioId: String(item.colegioProfesional?.colegioProfesionalId ?? ''),
    colegioNombre: item.colegioProfesional?.descripcion?.trim() ?? '',
    fechaColegiatura: item.fechaInicio,
    anios: Number(item.anios) || 0,
  }));
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
      id: rubro.id ?? String(respuesta.idFichaAntiguedad),
      periodoNivelAnterior: {
        ...data,
        id: String(respuesta.idPeriodoInmediato),
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
