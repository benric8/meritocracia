import { FichaValoracion } from '../../domain/models/ficha-valoracion.model';
import {
  crearRubroPublicacionJuridicaVacio,
  OrdenJuridico,
  PublicacionJuridica,
  RubroPublicacionJuridica,
} from '../../domain/models/rubro-publicacion-juridica.model';
import {
  GuardarPublicacionJuridicaRequestDto,
  PublicacionJuridicaDetalleDto,
} from '../dto/remote/FichaPublicacionJuridicaResponse.dto';

function aNumeroId(valor: string, etiqueta: string): number {
  const n = Number(String(valor ?? '').trim());
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${etiqueta} no válido.`);
  }
  return n;
}

function aPremiadaDesdeApi(valor: string | null | undefined): boolean {
  return String(valor ?? '').trim() === '1';
}

function aPremiadaParaApi(premiada: boolean): string {
  return premiada ? '1' : '0';
}

function aOrdenJuridico(valor: string): OrdenJuridico {
  const orden = String(valor ?? '').trim().toUpperCase();
  if (orden === 'JURIDICO' || orden === 'NO JURIDICO') {
    return orden;
  }
  throw new Error('Orden jurídico no válido.');
}

function aPublicacionDesdeDto(
  dto: PublicacionJuridicaDetalleDto,
  nombres: Partial<PublicacionJuridica> = {}
): PublicacionJuridica {
  const id = dto.idPublicacion ?? dto.id;
  if (id == null) {
    throw new Error('Publicación jurídica recibida sin identificador.');
  }

  return {
    id: String(id),
    tipoPublicacionId: String(dto.tipoPublicacionId),
    tipoPublicacionNombre: nombres.tipoPublicacionNombre ?? '',
    titulo: dto.titulo?.trim() ?? '',
    editorial: dto.editorial?.trim() ?? '',
    paginas: Number(dto.paginas) || 0,
    numEdicion: dto.numEdicion?.trim() ?? '',
    auspicio: dto.auspicio?.trim() ?? '',
    paisId: String(dto.paisId),
    paisNombre: nombres.paisNombre ?? '',
    ordenJuridico: aOrdenJuridico(dto.ordenJuridico),
    especialidad: dto.especialidad?.trim() ?? '',
    institucionId: dto.institucionId != null ? String(dto.institucionId) : '',
    institucionNombre: nombres.institucionNombre ?? '',
    fechaPublicacion: dto.fechaPublicacion?.trim().slice(0, 10) ?? '',
    premiada: aPremiadaDesdeApi(dto.premiada),
    archivoId: dto.archivoId != null ? String(dto.archivoId) : null,
    puntaje: Number(dto.puntaje) || 0,
  };
}

function sumarPuntajeItems(items: PublicacionJuridica[]): number {
  return items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
}

export function toRubroPublicacionJuridicaDesdeDetalle(
  data: PublicacionJuridicaDetalleDto[] | null | undefined
): RubroPublicacionJuridica {
  const detalle = data ?? [];
  const items = detalle.map((dto) => aPublicacionDesdeDto(dto));

  return {
    items,
    puntajeTotal: sumarPuntajeItems(items),
  };
}

export function toGuardarPublicacionJuridicaRequestDto(
  fichaId: string,
  item: PublicacionJuridica,
  rubroId: number,
  incluirFicha: boolean
): GuardarPublicacionJuridicaRequestDto {
  if (!Number.isFinite(rubroId) || rubroId <= 0) {
    throw new Error('Rubro no válido.');
  }

  const titulo = item.titulo?.trim() ?? '';
  const editorial = item.editorial?.trim() ?? '';
  const numEdicion = item.numEdicion?.trim() ?? '';
  const fecha = item.fechaPublicacion?.trim().slice(0, 10) ?? '';
  const paginas = Number(item.paginas);

  if (!titulo) {
    throw new Error('Título de la publicación requerido.');
  }
  if (!editorial) {
    throw new Error('Editorial requerida.');
  }
  if (!numEdicion) {
    throw new Error('Número de edición requerido.');
  }
  if (!fecha) {
    throw new Error('Fecha de publicación requerida.');
  }
  if (!Number.isFinite(paginas) || paginas < 1) {
    throw new Error('El número de páginas debe ser mayor a cero.');
  }

  const body: GuardarPublicacionJuridicaRequestDto = {
    rubroId,
    tipoPublicacionId: aNumeroId(item.tipoPublicacionId, 'Tipo de publicación'),
    titulo,
    editorial,
    paginas,
    numEdicion,
    auspicio: item.auspicio?.trim() ? item.auspicio.trim() : null,
    paisId: aNumeroId(item.paisId, 'País'),
    ordenJuridico: aOrdenJuridico(item.ordenJuridico),
    especialidad: item.especialidad?.trim() ? item.especialidad.trim() : null,
    institucionId: item.institucionId?.trim()
      ? aNumeroId(item.institucionId, 'Institución')
      : null,
    fechaPublicacion: fecha,
    premiada: aPremiadaParaApi(item.premiada),
    archivoId: item.archivoId ? aNumeroId(item.archivoId, 'Archivo') : null,
  };

  if (incluirFicha) {
    body.fichaValoracionId = aNumeroId(fichaId, 'Ficha de valoración');
  }

  return body;
}

export function aplicarPublicacionJuridicaEnFicha(
  ficha: FichaValoracion,
  item: PublicacionJuridica,
  respuesta: PublicacionJuridicaDetalleDto
): FichaValoracion {
  const rubro = ficha.rubroPublicacionJuridica ?? crearRubroPublicacionJuridicaVacio();
  const guardado = aPublicacionDesdeDto(respuesta, {
    tipoPublicacionNombre: item.tipoPublicacionNombre,
    paisNombre: item.paisNombre,
    institucionNombre: item.institucionNombre,
  });

  const sinAnterior = rubro.items.filter(
    (actual) => actual.id !== item.id && actual.id !== guardado.id
  );
  const items = [...sinAnterior, guardado];

  return {
    ...ficha,
    rubroPublicacionJuridica: {
      items,
      puntajeTotal: sumarPuntajeItems(items),
    },
    actualizadoEn: new Date().toISOString(),
  };
}

export function eliminarPublicacionJuridicaEnFicha(
  ficha: FichaValoracion,
  itemId: string
): FichaValoracion {
  const rubro = ficha.rubroPublicacionJuridica ?? crearRubroPublicacionJuridicaVacio();
  const items = rubro.items.filter((item) => item.id !== itemId);

  return {
    ...ficha,
    rubroPublicacionJuridica: {
      items,
      puntajeTotal: sumarPuntajeItems(items),
    },
    actualizadoEn: new Date().toISOString(),
  };
}
