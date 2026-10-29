import { IndicadorDashboardRubro } from '../../domain/models/dashboard-rubros.model';

/** Endpoints del dashboard de rubros (relativos a `environment.urlApi`). */
export const dashboardEndpoints = {
  /** Prefijo común de los indicadores (usado por el interceptor de errores). */
  RUBROS: 'dashboard/rubros/',
  /**
   * GET `dashboard/rubros/{indicador}?distrito_judicial_id=&nivel_magistrado_id=
   * &especialidad_id=&estado_carrera=&fecha_desde=&fecha_hasta=`.
   */
  rubro: (indicador: IndicadorDashboardRubro) => `dashboard/rubros/${indicador}`,
} as const;
