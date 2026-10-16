import {
  CursoEspecializacion,
  JuridicoCurso,
  LIMITE_NOMBRE_CURSO,
  ordenarCursosEspecializacion,
  puntajeSubrubroCursosEspecializacion,
  RubroCursosEspecializacion,
  TOPE_PUNTAJE_CURSOS_ESPECIALIZACION,
} from '../../domain/models/rubro-cursos-especializacion.model';
import {
  CursoEspecializacionDetalleDto,
  GuardarCursoEspecializacionRequestDto,
  ObtenerCursosEspecializacionDataDto,
} from '../dto/remote/FichaCursosEspecializacionResponse.dto';

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

function aJuridico(valor: string): JuridicoCurso {
  const texto = String(valor ?? '').trim();
  if (texto === '1' || texto === '0') {
    return texto;
  }
  throw new Error('Indique si el curso es jurídico.');
}

function aNombreCurso(valor: string): string {
  const texto = String(valor ?? '').trim();
  if (!texto) {
    throw new Error('El nombre del curso es obligatorio.');
  }
  if (texto.length > LIMITE_NOMBRE_CURSO) {
    throw new Error(`El nombre del curso supera los ${LIMITE_NOMBRE_CURSO} caracteres.`);
  }
  return texto;
}

function aTiempoHoras(valor: number): number {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error('Las horas deben ser un entero mayor que cero.');
  }
  return n;
}

function aArchivoId(valor: string | null): number | null {
  if (valor == null || String(valor).trim() === '') {
    return null;
  }
  return aNumeroId(String(valor), 'Archivo');
}

function aCursoDesdeDto(dto: CursoEspecializacionDetalleDto): CursoEspecializacion {
  if (dto.idCursoEspecializacion == null) {
    throw new Error('Curso recibido sin identificador.');
  }

  const puntaje = Number(dto.puntaje);
  const horas = Number(dto.tiempoHoras);
  const archivoId = dto.archivoId == null ? null : String(dto.archivoId);

  return {
    id: String(dto.idCursoEspecializacion),
    tipoCursoEspecializacionId: String(dto.tipoCursoEspecializacionId),
    tipoCursoEspecializacionDescripcion: dto.tipoCursoEspecializacionDescripcion?.trim() ?? '',
    nombreCurso: aNombreCurso(dto.nombreCurso),
    institucionId: String(dto.institucionId),
    institucionNombre: dto.institucionNombre?.trim() ?? '',
    paisId: String(dto.paisId),
    nombrePais: dto.nombrePais?.trim() ?? '',
    fechaInicio: aFecha(dto.fechaInicio, 'Fecha de inicio'),
    fechaFin: aFecha(dto.fechaFin, 'Fecha de fin'),
    juridico: aJuridico(dto.juridico),
    especialidadId: String(dto.especialidadId),
    especialidadDescripcion: dto.especialidadDescripcion?.trim() ?? '',
    tiempoHoras: Number.isFinite(horas) ? horas : 0,
    archivoId,
    puntaje: Number.isFinite(puntaje) ? puntaje : 0,
  };
}

function normalizarListaDetalle(
  data: ObtenerCursosEspecializacionDataDto | CursoEspecializacionDetalleDto[] | null | undefined
): CursoEspecializacionDetalleDto[] {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  return data.cursosEspecializacion ?? [];
}

function puntajeDeLista(
  data: ObtenerCursosEspecializacionDataDto | CursoEspecializacionDetalleDto[] | null | undefined,
  items: CursoEspecializacion[]
): number {
  const api = !Array.isArray(data) && data?.puntajeTotal != null ? Number(data.puntajeTotal) : NaN;
  if (Number.isFinite(api)) {
    return Math.min(TOPE_PUNTAJE_CURSOS_ESPECIALIZACION, api);
  }
  return puntajeSubrubroCursosEspecializacion(items);
}

export function toRubroCursosEspecializacionDesdeDetalle(
  data: ObtenerCursosEspecializacionDataDto | CursoEspecializacionDetalleDto[] | null | undefined
): RubroCursosEspecializacion {
  const items = ordenarCursosEspecializacion(
    normalizarListaDetalle(data).map((dto) => aCursoDesdeDto(dto))
  );
  return {
    items,
    puntajeTotal: puntajeDeLista(data, items),
  };
}

export function toGuardarCursoEspecializacionRequestDto(
  fichaId: string,
  item: CursoEspecializacion,
  rubroId: number,
  incluirFicha: boolean
): GuardarCursoEspecializacionRequestDto {
  if (!Number.isFinite(rubroId) || rubroId <= 0) {
    throw new Error('Rubro no válido.');
  }

  const fechaInicio = aFecha(item.fechaInicio, 'Fecha de inicio');
  const fechaFin = aFecha(item.fechaFin, 'Fecha de fin');
  if (fechaFin < fechaInicio) {
    throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
  }

  const body: GuardarCursoEspecializacionRequestDto = {
    rubroId,
    tipoCursoEspecializacionId: aNumeroId(item.tipoCursoEspecializacionId, 'Tipo de curso'),
    nombreCurso: aNombreCurso(item.nombreCurso),
    institucionId: aNumeroId(item.institucionId, 'Institución'),
    paisId: aNumeroId(item.paisId, 'País'),
    fechaInicio,
    fechaFin,
    juridico: aJuridico(item.juridico),
    especialidadId: aNumeroId(item.especialidadId, 'Especialidad'),
    tiempoHoras: aTiempoHoras(item.tiempoHoras),
    archivoId: aArchivoId(item.archivoId),
  };

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}

