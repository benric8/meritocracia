import {
  CuadroAntiguedad,
  FilaCuadroAntiguedad,
  TiempoAntiguedad,
} from '../../domain/models/cuadro-antiguedad.model';
import {
  CuadroAntiguedadDto,
  FilaCuadroAntiguedadDto,
  TiempoAntiguedadDto,
} from '../dto/remote/CuadroAntiguedadResponse.dto';

export function toCuadroAntiguedad(dto: CuadroAntiguedadDto | null | undefined): CuadroAntiguedad {
  return {
    idFechaValoracion: aTexto(dto?.idFechaValoracion),
    fechaValoracion: dto?.fechaValoracion ?? '',
    nota: dto?.nota?.trim() ?? '',
    filas: (dto?.filas ?? []).map(toFilaCuadroAntiguedad),
  };
}

function toFilaCuadroAntiguedad(dto: FilaCuadroAntiguedadDto, indice: number): FilaCuadroAntiguedad {
  return {
    orden: dto.orden ?? indice + 1,
    idMagistrado: aTexto(dto.idMagistrado),
    idFichaValoracion: aTexto(dto.idFichaValoracion),
    apellidosNombres: dto.apellidosNombres ?? '',
    fechaNacimiento: dto.fechaNacimiento ?? null,
    fechaJuramentoTitular: dto.fechaJuramentoTitular ?? null,
    tiempoTitular: toTiempo(dto.tiempoTitular),
    inicioJuezSuperior: dto.inicioJuezSuperior ?? null,
    finJuezSuperior: dto.finJuezSuperior ?? null,
    tiempoJuezSuperior: toTiempo(dto.tiempoJuezSuperior),
    inicioProvisional: dto.inicioProvisional ?? null,
    finProvisional: dto.finProvisional ?? null,
    periodosProvisional: dto.periodosProvisional ?? null,
    tiempoProvisional: toTiempo(dto.tiempoProvisional),
    fechaColegiatura: dto.fechaColegiatura ?? null,
    aniosColegiatura: dto.aniosColegiatura ?? null,
  };
}

function toTiempo(dto: TiempoAntiguedadDto | null | undefined): TiempoAntiguedad | null {
  if (!dto) {
    return null;
  }
  return { anios: dto.anios ?? 0, meses: dto.meses ?? 0, dias: dto.dias ?? 0 };
}

function aTexto(valor: number | string | null | undefined): string {
  return valor == null ? '' : String(valor);
}
