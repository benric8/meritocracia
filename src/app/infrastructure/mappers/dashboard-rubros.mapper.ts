import {
  IndicadorDashboard,
  ItemIndicadorDashboard,
  SerieIndicadorDashboard,
} from '../../domain/models/dashboard-rubros.model';
import {
  IndicadorDashboardDto,
  ItemIndicadorDto,
  SerieIndicadorDto,
} from '../dto/remote/DashboardRubrosResponse.dto';

export function toIndicadorDashboard(dto: IndicadorDashboardDto | undefined): IndicadorDashboard {
  return {
    indicador: dto?.indicador ?? '',
    descripcion: dto?.descripcion ?? '',
    total: dto?.total ?? 0,
    series: (dto?.series ?? []).map(toSerieIndicador),
  };
}

function toSerieIndicador(dto: SerieIndicadorDto): SerieIndicadorDashboard {
  return {
    serie: dto.serie ?? '',
    total: dto.total ?? 0,
    items: (dto.items ?? []).map(toItemIndicador),
  };
}

function toItemIndicador(dto: ItemIndicadorDto): ItemIndicadorDashboard {
  return {
    clave: dto.clave ?? '',
    etiqueta: dto.etiqueta ?? dto.clave ?? '',
    cantidad: dto.cantidad ?? 0,
    porcentaje: dto.porcentaje ?? 0,
  };
}
