import { FichaValoracion } from '../../domain/models/ficha-valoracion.model';
import {
  crearRubroCursosEspecializacionVacio,
  CursoEspecializacion,
  JuridicoCurso,
  LIMITE_NOMBRE_CURSO,
  ordenarCursosEspecializacion,
  puntajeSubrubroCursosEspecializacion,
  RubroCursosEspecializacion,
  TOPE_PUNTAJE_CURSOS_ESPECIALIZACION,
  TrasladoEventoCurso,
} from '../../domain/models/rubro-cursos-especializacion.model';
import {
  CursoEspecializacionDetalleDto,
  GuardarCursoEspecializacionRequestDto,
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

function aTrasladoEvento(valor: string): TrasladoEventoCurso {
  const texto = String(valor ?? '').trim();
  if (texto === '1' || texto === '0') {
    return texto;
  }
  throw new Error('Traslado a eventos no válido.');
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
    trasladoEvento: aTrasladoEvento(dto.trasladoEvento),
  };
}

export function toRubroCursosEspecializacionDesdeDetalle(
  data: CursoEspecializacionDetalleDto[] | null | undefined,
  puntajeOficial?: number | null
): RubroCursosEspecializacion {
  const items = ordenarCursosEspecializacion((data ?? []).map((dto) => aCursoDesdeDto(dto)));
  const local = puntajeSubrubroCursosEspecializacion(items);
  const oficial =
    puntajeOficial != null && Number.isFinite(puntajeOficial) && puntajeOficial > 0
      ? Math.min(TOPE_PUNTAJE_CURSOS_ESPECIALIZACION, puntajeOficial)
      : local;

  return {
    items,
    puntajeTotal: oficial,
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

export function aplicarCursoEspecializacionEnFicha(
  ficha: FichaValoracion,
  item: CursoEspecializacion,
  respuesta: CursoEspecializacionDetalleDto
): FichaValoracion {
  const rubro = ficha.rubroCursosEspecializacion ?? crearRubroCursosEspecializacionVacio();
  const guardada = aCursoDesdeDto(respuesta);
  const conTextos: CursoEspecializacion = {
    ...guardada,
    tipoCursoEspecializacionDescripcion:
      guardada.tipoCursoEspecializacionDescripcion || item.tipoCursoEspecializacionDescripcion,
    institucionNombre: guardada.institucionNombre || item.institucionNombre,
    nombrePais: guardada.nombrePais || item.nombrePais,
    especialidadDescripcion: guardada.especialidadDescripcion || item.especialidadDescripcion,
  };
  const sinAnterior = rubro.items.filter(
    (actual) => actual.id !== item.id && actual.id !== conTextos.id
  );

  return {
    ...ficha,
    rubroCursosEspecializacion: {
      items: ordenarCursosEspecializacion([...sinAnterior, conTextos]),
      puntajeTotal: rubro.puntajeTotal,
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function eliminarCursoEspecializacionEnFicha(
  ficha: FichaValoracion,
  itemId: string
): FichaValoracion {
  const rubro = ficha.rubroCursosEspecializacion ?? crearRubroCursosEspecializacionVacio();
  const items = rubro.items.filter((item) => item.id !== itemId);
  return {
    ...ficha,
    rubroCursosEspecializacion: {
      items,
      puntajeTotal: puntajeSubrubroCursosEspecializacion(items),
    },
    actualizadoEn: new Date().toISOString(),
  };
}
