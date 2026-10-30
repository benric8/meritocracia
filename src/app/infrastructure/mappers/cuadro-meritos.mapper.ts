import { CuadroMeritos, FilaCuadroMeritos } from '../../domain/models/cuadro-meritos.model';
import { CuadroMeritosDto, FilaCuadroMeritosDto } from '../dto/remote/CuadroMeritosResponse.dto';

export function toCuadroMeritos(dto: CuadroMeritosDto | null | undefined): CuadroMeritos {
  return {
    idFechaValoracion: aTexto(dto?.idFechaValoracion),
    fechaValoracion: dto?.fechaValoracion ?? '',
    puntajeMaximo: dto?.puntajeMaximo ?? 0,
    notaProduccion: dto?.notaProduccion?.trim() ?? '',
    notaCesantes: dto?.notaCesantes?.trim() || null,
    filas: (dto?.filas ?? []).map(toFilaCuadroMeritos),
  };
}

function toFilaCuadroMeritos(dto: FilaCuadroMeritosDto, indice: number): FilaCuadroMeritos {
  return {
    orden: dto.orden ?? indice + 1,
    idMagistrado: aTexto(dto.idMagistrado),
    idFichaValoracion: aTexto(dto.idFichaValoracion),
    dni: dto.dni ?? '',
    apellidosNombres: dto.apellidosNombres ?? '',
    cesante: dto.cesante ?? false,
    distritoJudicial: dto.distritoJudicial ?? null,
    primeraEspecialidad: dto.primeraEspecialidad ?? null,
    segundaEspecialidad: dto.segundaEspecialidad ?? null,
    puntajeAntiguedad: dto.puntajeAntiguedad ?? 0,
    puntajeGradosTitulos: dto.puntajeGradosTitulos ?? 0,
    puntajeEstudiosAmag: dto.puntajeEstudiosAmag ?? 0,
    puntajeDoctoradoMaestria: dto.puntajeDoctoradoMaestria ?? 0,
    puntajePasantias: dto.puntajePasantias ?? 0,
    puntajeCursos: dto.puntajeCursos ?? 0,
    puntajeExpositor: dto.puntajeExpositor ?? 0,
    puntajeAsistenciaEventos: dto.puntajeAsistenciaEventos ?? 0,
    puntajeOfimatica: dto.puntajeOfimatica ?? 0,
    puntajeIdiomas: dto.puntajeIdiomas ?? 0,
    puntajePerfeccionamiento: dto.puntajePerfeccionamiento ?? 0,
    puntajePublicaciones: dto.puntajePublicaciones ?? 0,
    puntajeDistinciones: dto.puntajeDistinciones ?? 0,
    puntajeDocencia: dto.puntajeDocencia ?? 0,
    puntajeDemeritos: dto.puntajeDemeritos ?? 0,
    puntajeTotal: dto.puntajeTotal ?? 0,
    criterioI: dto.criterioI ?? 0,
    criterioII: dto.criterioII ?? 0,
    criterioIII: dto.criterioIII ?? null,
  };
}

function aTexto(valor: number | string | null | undefined): string {
  return valor == null ? '' : String(valor);
}
