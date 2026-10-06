import {
  EstudioOfimatica,
  LIMITE_NOMBRE_CURSO_OFIMATICA,
  ordenarOfimatica,
  puntajeSubrubroOfimatica,
  RubroOfimatica,
  TOPE_PUNTAJE_OFIMATICA,
} from '../../domain/models/rubro-ofimatica.model';
import {
  GuardarOfimaticaRequestDto,
  OfimaticaDetalleDto,
} from '../dto/remote/FichaOfimaticaResponse.dto';

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

function aNombreCurso(valor: string): string {
  const texto = String(valor ?? '').trim();
  if (!texto) {
    throw new Error('El nombre del curso es obligatorio.');
  }
  if (texto.length > LIMITE_NOMBRE_CURSO_OFIMATICA) {
    throw new Error(`El nombre del curso supera los ${LIMITE_NOMBRE_CURSO_OFIMATICA} caracteres.`);
  }
  return texto;
}

function aHoras(valor: number): number {
  const horas = Number(valor);
  if (!Number.isInteger(horas) || horas <= 0) {
    throw new Error('La duración en horas debe ser mayor que cero.');
  }
  return horas;
}

function aArchivoId(valor: string | null): number | null {
  if (valor == null || String(valor).trim() === '') {
    return null;
  }
  return aNumeroId(String(valor), 'Archivo');
}

function aOfimaticaDesdeDto(dto: OfimaticaDetalleDto): EstudioOfimatica {
  if (dto.idOfimatica == null) {
    throw new Error('Estudio de ofimática recibido sin identificador.');
  }

  const puntaje = Number(dto.puntaje);
  const archivoId = dto.archivoId == null ? null : String(dto.archivoId);

  return {
    id: String(dto.idOfimatica),
    nombreCurso: aNombreCurso(dto.nombreCurso),
    institucionId: String(dto.institucionId),
    institucionNombre: dto.institucionNombre?.trim() ?? '',
    paisId: String(dto.paisId),
    nombrePais: dto.nombrePais?.trim() ?? '',
    duracionHoras: aHoras(dto.duracionHoras),
    nivelOfimaticaId: String(dto.nivelOfimaticaId),
    nivelOfimaticaCodigo: dto.nivelOfimaticaCodigo?.trim() ?? '',
    nivelOfimaticaDescripcion: dto.nivelOfimaticaDescripcion?.trim() ?? '',
    tipoDocumentoId: String(dto.tipoDocumentoId),
    tipoDocumentoDescripcion: dto.tipoDocumentoDescripcion?.trim() ?? '',
    fechaObtencion: aFecha(dto.fechaObtencion, 'Fecha de obtención'),
    archivoId,
    puntaje: Number.isFinite(puntaje) ? puntaje : 0,
  };
}

export function toRubroOfimaticaDesdeDetalle(
  data: OfimaticaDetalleDto[] | null | undefined,
  puntajeOficial?: number | null
): RubroOfimatica {
  const items = ordenarOfimatica((data ?? []).map((dto) => aOfimaticaDesdeDto(dto)));
  const local = puntajeSubrubroOfimatica(items);
  const oficial =
    puntajeOficial != null && Number.isFinite(puntajeOficial) && puntajeOficial > 0
      ? Math.min(TOPE_PUNTAJE_OFIMATICA, puntajeOficial)
      : local;

  return {
    items,
    puntajeTotal: oficial,
  };
}

/**
 * El listado no trae los textos de catálogo. Se conservan los de la línea previa
 * o los del formulario que acaba de guardarse.
 */
export function conservarTextosOfimatica(
  rubro: RubroOfimatica,
  previos: EstudioOfimatica[],
  enviado?: EstudioOfimatica
): RubroOfimatica {
  const porId = new Map(previos.map((item) => [item.id, item]));
  return {
    ...rubro,
    items: rubro.items.map((item) => {
      const base = textoReferencia(item, porId, enviado);
      if (!base) {
        return item;
      }
      return {
        ...item,
        institucionNombre: item.institucionNombre || base.institucionNombre,
        nombrePais: item.nombrePais || base.nombrePais,
        nivelOfimaticaCodigo: item.nivelOfimaticaCodigo || base.nivelOfimaticaCodigo,
        nivelOfimaticaDescripcion:
          item.nivelOfimaticaDescripcion || base.nivelOfimaticaDescripcion,
        tipoDocumentoDescripcion: item.tipoDocumentoDescripcion || base.tipoDocumentoDescripcion,
      };
    }),
  };
}

function textoReferencia(
  item: EstudioOfimatica,
  porId: Map<string, EstudioOfimatica>,
  enviado?: EstudioOfimatica
): EstudioOfimatica | undefined {
  if (enviado?.id === item.id) {
    return enviado;
  }
  const previo = porId.get(item.id);
  if (previo) {
    return previo;
  }
  if (!enviado) {
    return undefined;
  }
  const coincide =
    enviado.nombreCurso === item.nombreCurso &&
    enviado.institucionId === item.institucionId &&
    enviado.fechaObtencion === item.fechaObtencion &&
    enviado.nivelOfimaticaId === item.nivelOfimaticaId;
  return coincide ? enviado : undefined;
}

export function toGuardarOfimaticaRequestDto(
  fichaId: string,
  item: EstudioOfimatica,
  rubroId: number,
  incluirFicha: boolean
): GuardarOfimaticaRequestDto {
  if (!Number.isFinite(rubroId) || rubroId <= 0) {
    throw new Error('Rubro no válido.');
  }

  const body: GuardarOfimaticaRequestDto = {
    rubroId,
    nombreCurso: aNombreCurso(item.nombreCurso),
    institucionId: aNumeroId(item.institucionId, 'Institución'),
    paisId: aNumeroId(item.paisId, 'País'),
    duracionHoras: aHoras(item.duracionHoras),
    nivelOfimaticaId: aNumeroId(item.nivelOfimaticaId, 'Nivel de ofimática'),
    tipoDocumentoId: aNumeroId(item.tipoDocumentoId, 'Tipo de documento'),
    fechaObtencion: aFecha(item.fechaObtencion, 'Fecha de obtención'),
    archivoId: aArchivoId(item.archivoId),
  };

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}
