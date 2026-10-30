import {
  CuadroAntiguedadSuperiores,
  FilaCuadroAntiguedadSuperiores,
} from '../../domain/models/cuadro-antiguedad-superiores.model';
import {
  CuadroAntiguedadSuperioresDto,
  FilaCuadroAntiguedadSuperioresDto,
} from '../dto/remote/CuadroAntiguedadSuperioresResponse.dto';
import { toTiempo } from './cuadro-antiguedad.mapper';

export function toCuadroAntiguedadSuperiores(
  dto: CuadroAntiguedadSuperioresDto | null | undefined
): CuadroAntiguedadSuperiores {
  return {
    idFechaValoracion: aTexto(dto?.idFechaValoracion),
    fechaValoracion: dto?.fechaValoracion ?? '',
    idDistritoJudicial: aTexto(dto?.idDistritoJudicial),
    distritoJudicial: dto?.distritoJudicial?.trim() || null,
    notaCesantes: dto?.notaCesantes?.trim() || null,
    notaDistrito: dto?.notaDistrito?.trim() ?? '',
    notaProvisional: dto?.notaProvisional?.trim() ?? '',
    filas: (dto?.filas ?? []).map(toFila),
  };
}

function toFila(
  dto: FilaCuadroAntiguedadSuperioresDto,
  indice: number
): FilaCuadroAntiguedadSuperiores {
  const orden = dto.orden ?? indice + 1;
  return {
    orden,
    ordenNacional: dto.ordenNacional ?? orden,
    idMagistrado: aTexto(dto.idMagistrado),
    idFichaValoracion: aTexto(dto.idFichaValoracion),
    apellidosNombres: dto.apellidosNombres ?? '',
    cesante: dto.cesante === true,
    fechaNacimiento: dto.fechaNacimiento ?? null,
    distritoJudicial: dto.distritoJudicial ?? null,
    fechaJuramentoTitular: dto.fechaJuramentoTitular ?? null,
    horaJuramentoTitular: dto.horaJuramentoTitular ?? null,
    fechaCese: dto.fechaCese ?? null,
    tiempoTitularidad: toTiempo(dto.tiempoTitularidad),
    fechaReincorporacion: dto.fechaReincorporacion ?? null,
    tiempoReincorporacion: toTiempo(dto.tiempoReincorporacion),
    tiempoTotal: toTiempo(dto.tiempoTotal),
    inicioJuezEspecializado: dto.inicioJuezEspecializado ?? null,
    finJuezEspecializado: dto.finJuezEspecializado ?? null,
    tiempoJuezEspecializado: toTiempo(dto.tiempoJuezEspecializado),
    inicioProvisional: dto.inicioProvisional ?? null,
    finProvisional: dto.finProvisional ?? null,
    periodosProvisional: dto.periodosProvisional ?? null,
    tiempoProvisional: toTiempo(dto.tiempoProvisional),
    fechaColegiatura: dto.fechaColegiatura ?? null,
    aniosColegiatura: dto.aniosColegiatura ?? null,
  };
}

function aTexto(valor: number | string | null | undefined): string {
  return valor == null ? '' : String(valor);
}
