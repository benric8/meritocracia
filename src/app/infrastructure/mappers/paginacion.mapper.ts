import { ResultadoPaginado } from '../../domain/models/paginacion.model';
import { PaginatedResponseDto } from '../dto/remote/PaginatedResponse.dto';

export function toResultadoPaginado<TDto, TModel>(
  respuesta: PaginatedResponseDto<TDto>,
  mapElemento: (dto: TDto) => TModel
): ResultadoPaginado<TModel> {
  return {
    elementos: (respuesta.data ?? []).map(mapElemento),
    totalRegistros: respuesta.totalRegistros ?? 0,
    totalPaginas: respuesta.totalPaginas ?? 0,
    paginaActual: respuesta.paginaActual ?? 1,
    tamanioPagina: respuesta.tamanioPagina ?? 0,
  };
}
