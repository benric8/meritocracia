import { FichaValoracion } from '../../domain/models/ficha-valoracion.model';
import {
  ANIO_ESTUDIO_MAX,
  ANIO_ESTUDIO_MIN,
  crearRubroEstudiosPosgradoVacio,
  EstudioPosgrado,
  LIMITE_MENCION_POSGRADO,
  NOTA_MAXIMA,
  NOTA_MINIMA,
  RubroEstudiosPosgrado,
  SEMESTRE_MAXIMO,
  SEMESTRE_MINIMO,
} from '../../domain/models/rubro-estudios-posgrado.model';
import {
  EstudioPosgradoDetalleDto,
  GuardarEstudioPosgradoRequestDto,
} from '../dto/remote/FichaEstudiosPosgradoResponse.dto';

function aNumeroId(valor: string, etiqueta: string): number {
  const n = Number(String(valor ?? '').trim());
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`${etiqueta} no válido.`);
  }
  return n;
}

function quitarTildes(valor: string): string {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function aEntero(valor: number, etiqueta: string): number {
  const n = Number(valor);
  if (!Number.isInteger(n)) {
    throw new Error(`${etiqueta} debe ser un entero.`);
  }
  return n;
}

function aTextoLimitado(valor: string, maximo: number, etiqueta: string): string {
  const texto = String(valor ?? '').trim();
  if (!texto) {
    throw new Error(`${etiqueta} requerida.`);
  }
  if (texto.length > maximo) {
    throw new Error(`${etiqueta} supera los ${maximo} caracteres.`);
  }
  return texto;
}

function aEspecialidad(valor: string): string {
  const especialidad = quitarTildes(String(valor ?? ''))
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
  if (especialidad === 'JURIDICA' || especialidad === 'NO JURIDICA') {
    return especialidad;
  }
  throw new Error('Especialidad no válida.');
}

function aCondicionAcademica(valor: string): string {
  const condicion = quitarTildes(String(valor ?? ''))
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
  if (condicion === 'INCONCLUSO' || condicion === 'CONCLUIDO_SIN_GRADO') {
    return condicion;
  }
  throw new Error('Condición académica no válida.');
}

function aNota(valor: number): number {
  const n = Number(valor);
  if (!Number.isFinite(n) || n < NOTA_MINIMA || n > NOTA_MAXIMA) {
    throw new Error('Cada nota debe estar entre 0.00 y 20.00.');
  }
  return Math.round(n * 100) / 100;
}

function aEstudioPosgradoDesdeDto(dto: EstudioPosgradoDetalleDto): EstudioPosgrado {
  const id = dto.idEstudioPosgrado ?? dto.id;
  if (id == null) {
    throw new Error('Estudio de posgrado recibido sin identificador.');
  }

  const puntaje = Number(dto.puntaje);
  const promedio = dto.promedio == null ? null : Number(dto.promedio);

  return {
    id: String(id),
    institucionId: String(dto.institucionId),
    institucionNombre: dto.institucion?.trim() ?? '',
    paisId: String(dto.paisId),
    paisNombre: dto.paisNombre?.trim() ?? '',
    especialidad: aEspecialidad(dto.especialidad),
    mencion: dto.mencion?.trim() ?? '',
    condicionAcademica: aCondicionAcademica(dto.condicionAcademica),
    numeroSemestre: aEntero(dto.numeroSemestre, 'Número de semestre'),
    anioInicio: aEntero(dto.anioInicio, 'Año de inicio'),
    anioFin: aEntero(dto.anioFin, 'Año de fin'),
    notas: (dto.notas ?? []).map((nota) => aNota(nota)),
    promedio: promedio != null && Number.isFinite(promedio) ? promedio : null,
    puntaje: Number.isFinite(puntaje) ? puntaje : 0,
  };
}

export function toRubroEstudiosPosgradoDesdeDetalle(
  data: EstudioPosgradoDetalleDto[] | null | undefined
): RubroEstudiosPosgrado {
  return {
    items: ordenarEstudiosPosgrado((data ?? []).map((dto) => aEstudioPosgradoDesdeDto(dto))),
    puntajeTotal: 0,
  };
}

/** Año de inicio descendente, semestre ascendente y, en empate, id descendente. */
export function ordenarEstudiosPosgrado(items: EstudioPosgrado[]): EstudioPosgrado[] {
  return [...items].sort((a, b) => {
    if (a.anioInicio !== b.anioInicio) {
      return b.anioInicio - a.anioInicio;
    }
    if (a.numeroSemestre !== b.numeroSemestre) {
      return a.numeroSemestre - b.numeroSemestre;
    }
    const idA = Number(a.id);
    const idB = Number(b.id);
    if (Number.isFinite(idA) && Number.isFinite(idB) && idA !== idB) {
      return idB - idA;
    }
    return 0;
  });
}

export function toGuardarEstudioPosgradoRequestDto(
  fichaId: string,
  item: EstudioPosgrado,
  rubroId: number,
  incluirFicha: boolean
): GuardarEstudioPosgradoRequestDto {
  if (!Number.isFinite(rubroId) || rubroId <= 0) {
    throw new Error('Rubro no válido.');
  }

  const mencion = aTextoLimitado(item.mencion, LIMITE_MENCION_POSGRADO, 'Mención');
  const numeroSemestre = aEntero(item.numeroSemestre, 'Número de semestre');
  if (numeroSemestre < SEMESTRE_MINIMO || numeroSemestre > SEMESTRE_MAXIMO) {
    throw new Error(
      `El número de semestre debe ser un entero entre ${SEMESTRE_MINIMO} y ${SEMESTRE_MAXIMO}.`
    );
  }

  const anioInicio = aEntero(item.anioInicio, 'Año de inicio');
  const anioFin = aEntero(item.anioFin, 'Año de fin');
  if (anioInicio < ANIO_ESTUDIO_MIN || anioInicio > ANIO_ESTUDIO_MAX) {
    throw new Error(`El año de inicio debe estar entre ${ANIO_ESTUDIO_MIN} y ${ANIO_ESTUDIO_MAX}.`);
  }
  if (anioFin < ANIO_ESTUDIO_MIN || anioFin > ANIO_ESTUDIO_MAX) {
    throw new Error(`El año de fin debe estar entre ${ANIO_ESTUDIO_MIN} y ${ANIO_ESTUDIO_MAX}.`);
  }
  if (anioFin < anioInicio) {
    throw new Error('El año de fin no puede ser anterior al año de inicio.');
  }

  if (!item.notas?.length) {
    throw new Error('Registre al menos una nota.');
  }

  const body: GuardarEstudioPosgradoRequestDto = {
    rubroId,
    institucionId: aNumeroId(item.institucionId, 'Universidad'),
    paisId: aNumeroId(item.paisId, 'País'),
    especialidad: aEspecialidad(item.especialidad),
    mencion,
    condicionAcademica: aCondicionAcademica(item.condicionAcademica),
    numeroSemestre,
    anioInicio,
    anioFin,
    notas: item.notas.map((nota) => aNota(nota)),
  };

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}

export function aplicarEstudioPosgradoEnFicha(
  ficha: FichaValoracion,
  item: EstudioPosgrado,
  respuesta: EstudioPosgradoDetalleDto
): FichaValoracion {
  const rubro = ficha.rubroEstudiosPosgrado ?? crearRubroEstudiosPosgradoVacio();
  const guardado = aEstudioPosgradoDesdeDto(respuesta);
  const conNombres: EstudioPosgrado = {
    ...guardado,
    institucionNombre: guardado.institucionNombre || item.institucionNombre,
    paisNombre: guardado.paisNombre || item.paisNombre,
  };
  const sinAnterior = rubro.items.filter(
    (actual) => actual.id !== item.id && actual.id !== conNombres.id
  );

  return {
    ...ficha,
    rubroEstudiosPosgrado: {
      items: ordenarEstudiosPosgrado([...sinAnterior, conNombres]),
      puntajeTotal: rubro.puntajeTotal,
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function reemplazarEstudiosPosgradoEnFicha(
  ficha: FichaValoracion,
  detalle: EstudioPosgradoDetalleDto[]
): FichaValoracion {
  const rubro = ficha.rubroEstudiosPosgrado ?? crearRubroEstudiosPosgradoVacio();
  return {
    ...ficha,
    rubroEstudiosPosgrado: {
      items: detalle.map((dto) => aEstudioPosgradoDesdeDto(dto)),
      puntajeTotal: rubro.puntajeTotal,
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function eliminarEstudioPosgradoEnFicha(
  ficha: FichaValoracion,
  itemId: string
): FichaValoracion {
  const rubro = ficha.rubroEstudiosPosgrado ?? crearRubroEstudiosPosgradoVacio();
  return {
    ...ficha,
    rubroEstudiosPosgrado: {
      items: rubro.items.filter((item) => item.id !== itemId),
      puntajeTotal: rubro.puntajeTotal,
    },
    actualizadoEn: new Date().toISOString(),
  };
}
