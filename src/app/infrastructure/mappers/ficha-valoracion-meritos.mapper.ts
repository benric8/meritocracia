import {
  AntiguedadFichaMeritos,
  FichaValoracionMeritos,
  IndicadorFichaMeritos,
  RubroFichaMeritos,
} from '../../domain/models/ficha-valoracion-meritos.model';
import {
  AntiguedadFichaMeritosDto,
  FichaValoracionMeritosDto,
  IndicadorFichaMeritosDto,
  RubroFichaMeritosDto,
} from '../dto/remote/FichaValoracionMeritosResponse.dto';
import { toTiempo } from './cuadro-antiguedad.mapper';

export function toFichaValoracionMeritos(
  dto: FichaValoracionMeritosDto | null | undefined
): FichaValoracionMeritos {
  return {
    idFicha: aTexto(dto?.idFicha),
    idFechaValoracion: aTexto(dto?.idFechaValoracion),
    fechaCalificacion: dto?.fechaCalificacion ?? '',
    puntajeTotal: dto?.puntajeTotal ?? 0,
    puntajeMaximo: dto?.puntajeMaximo ?? 0,
    puntajePositivo: dto?.puntajePositivo ?? 0,
    puntajeDemeritos: dto?.puntajeDemeritos ?? 0,
    antiguedadAcumulada: toTiempo(dto?.antiguedadAcumulada),
    idMagistrado: aTexto(dto?.idMagistrado),
    apellidosNombres: dto?.apellidosNombres ?? '',
    dni: dto?.dni ?? '',
    fechaNacimiento: dto?.fechaNacimiento ?? null,
    edad: dto?.edad ?? null,
    cargo: dto?.cargo ?? null,
    distritoJudicial: dto?.distritoJudicial ?? null,
    primeraEspecialidad: dto?.primeraEspecialidad ?? null,
    segundaEspecialidad: dto?.segundaEspecialidad ?? null,
    antiguedad: dto?.antiguedad ? toAntiguedad(dto.antiguedad) : null,
    rubros: (dto?.rubros ?? []).map(toRubro),
  };
}

function toRubro(dto: RubroFichaMeritosDto): RubroFichaMeritos {
  return {
    numero: dto.numero ?? '',
    titulo: dto.titulo ?? '',
    puntajeMaximo: dto.puntajeMaximo ?? null,
    puntaje: dto.puntaje ?? 0,
    indicadores: (dto.indicadores ?? []).map(toIndicador),
    subrubros: (dto.subrubros ?? []).map(toRubro),
  };
}

function toIndicador(dto: IndicadorFichaMeritosDto): IndicadorFichaMeritos {
  return {
    descripcion: dto.descripcion ?? '',
    cuenta: dto.cuenta === true,
    cantidad: dto.cantidad ?? 0,
    detalle: dto.detalle?.trim() || null,
    anio: dto.anio ?? null,
    nota: dto.nota ?? null,
    puntaje: dto.puntaje ?? 0,
  };
}

function toAntiguedad(dto: AntiguedadFichaMeritosDto): AntiguedadFichaMeritos {
  return {
    fechaJuramento: dto.fechaJuramento ?? null,
    horaJuramento: dto.horaJuramento ?? null,
    fechaCese: dto.fechaCese ?? null,
    fechaReincorporacion: dto.fechaReincorporacion ?? null,
    fechaValoracion: dto.fechaValoracion ?? null,
    tiempo: toTiempo(dto.tiempo),
    puntaje: dto.puntaje ?? 0,
    puntajeMaximo: dto.puntajeMaximo ?? null,
    cargoAnterior: dto.cargoAnterior?.trim() || null,
    tiempoCargoAnterior: toTiempo(dto.tiempoCargoAnterior),
    periodosProvisional: dto.periodosProvisional ?? 0,
    tiempoProvisional: toTiempo(dto.tiempoProvisional),
    fechaColegiatura: dto.fechaColegiatura ?? null,
    aniosColegiatura: dto.aniosColegiatura ?? null,
  };
}

function aTexto(valor: number | string | null | undefined): string {
  return valor == null ? '' : String(valor);
}
