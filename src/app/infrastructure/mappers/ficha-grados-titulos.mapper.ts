import {
  crearRubroGradosTitulosVacio,
  FichaValoracion,
} from '../../domain/models/ficha-valoracion.model';
import {
  GradoTitulo,
  GradoTituloFormulario,
  RubroGradosTitulos,
} from '../../domain/models/rubro-grados-titulos.model';
import {
  GradoTituloDetalleDto,
  GuardarGradoTituloRequestDto,
  ObtenerGradosTitulosDataDto,
} from '../dto/remote/FichaGradosTitulosResponse.dto';

function aNumeroId(valor: string, etiqueta: string): number {
  const n = Number(String(valor ?? '').trim());
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${etiqueta} no válido.`);
  }
  return n;
}

function aGradoTituloDesdeDto(dto: GradoTituloDetalleDto): GradoTitulo {
  const id = dto.idGradoTitulo ?? dto.idFichaGradoTitulo;
  if (id == null) {
    throw new Error('Grado o título recibido sin identificador.');
  }

  return {
    id: String(id),
    gradoAcademicoId: String(dto.gradoAcademicoId),
    gradoAcademicoNombre: dto.gradoAcademicoNombre?.trim() ?? '',
    universidadId: String(dto.universidadId),
    universidadNombre: dto.universidadNombre?.trim() ?? '',
    paisId: String(dto.paisId),
    paisNombre: dto.paisNombre?.trim() ?? '',
    fechaObtencion: dto.fechaObtencion?.trim().slice(0, 10) ?? '',
    especialidad: dto.especialidad?.trim() ?? '',
    mencion: dto.mencion?.trim() ?? '',
    observacion: dto.observacion?.trim() ?? '',
    puntaje: Number(dto.puntaje) || 0,
  };
}

function sumarPuntajeItems(items: GradoTitulo[]): number {
  return items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
}

function normalizarListaDetalle(
  data: ObtenerGradosTitulosDataDto | GradoTituloDetalleDto[] | null | undefined
): GradoTituloDetalleDto[] {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  return data.gradosTitulos ?? [];
}

export function toRubroGradosTitulosDesdeDetalle(
  data: ObtenerGradosTitulosDataDto | GradoTituloDetalleDto[] | null | undefined
): RubroGradosTitulos {
  const detalle = normalizarListaDetalle(data);
  const items = detalle.map(aGradoTituloDesdeDto);
  const puntajeApi =
    !Array.isArray(data) && data?.puntajeTotal != null
      ? Number(data.puntajeTotal)
      : sumarPuntajeItems(items);

  return {
    items,
    puntajeTotal: Number.isFinite(puntajeApi) ? puntajeApi : sumarPuntajeItems(items),
  };
}

export function toGuardarGradoTituloRequestDto(
  fichaId: string,
  data: GradoTituloFormulario,
  rubroId: number,
  incluirFicha: boolean
): GuardarGradoTituloRequestDto {
  if (!data.fechaObtencion?.trim()) {
    throw new Error('Fecha de obtención requerida.');
  }

  if (!Number.isFinite(rubroId) || rubroId <= 0) {
    throw new Error('Rubro no válido.');
  }

  const body: GuardarGradoTituloRequestDto = {
    rubroId,
    gradoAcademicoId: aNumeroId(data.gradoAcademicoId, 'Grado académico'),
    universidadId: aNumeroId(data.universidadId, 'Universidad'),
    paisId: aNumeroId(data.paisId, 'País'),
    fechaObtencion: data.fechaObtencion.trim().slice(0, 10),
    especialidad: data.especialidad.trim(),
    mencion: data.mencion.trim(),
    observacion: data.observacion?.trim() ? data.observacion.trim() : null,
  };

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}

export function aplicarGradoTituloEnFicha(
  ficha: FichaValoracion,
  item: GradoTitulo,
  respuesta: GradoTituloDetalleDto
): FichaValoracion {
  const rubro = ficha.rubroGradosTitulos ?? crearRubroGradosTitulosVacio();
  const guardado = aGradoTituloDesdeDto({
    ...respuesta,
    gradoAcademicoNombre: respuesta.gradoAcademicoNombre ?? item.gradoAcademicoNombre,
    universidadNombre: respuesta.universidadNombre ?? item.universidadNombre,
    paisNombre: respuesta.paisNombre ?? item.paisNombre,
  });

  const sinAnterior = rubro.items.filter((actual) => actual.id !== item.id && actual.id !== guardado.id);
  const items = [...sinAnterior, guardado];

  return {
    ...ficha,
    rubroGradosTitulos: {
      items,
      puntajeTotal: sumarPuntajeItems(items),
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function eliminarGradoTituloEnFicha(
  ficha: FichaValoracion,
  itemId: string
): FichaValoracion {
  const rubro = ficha.rubroGradosTitulos ?? crearRubroGradosTitulosVacio();
  const items = rubro.items.filter((item) => item.id !== itemId);

  return {
    ...ficha,
    rubroGradosTitulos: {
      items,
      puntajeTotal: sumarPuntajeItems(items),
    },
    actualizadoEn: new Date().toISOString(),
  };
}
