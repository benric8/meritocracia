import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  FiltrosDashboardRubros,
  IndicadorDashboard,
  IndicadorDashboardRubro,
} from '../models/dashboard-rubros.model';

/**
 * Puerto de salida: dashboard estadístico de rubros de valoración (solo Administrador).
 */
export interface DashboardRubrosPort {
  obtenerIndicador(
    indicador: IndicadorDashboardRubro,
    filtros: FiltrosDashboardRubros
  ): Observable<IndicadorDashboard>;
}

export const DASHBOARD_RUBROS_PORT = new InjectionToken<DashboardRubrosPort>(
  'DASHBOARD_RUBROS_PORT'
);
