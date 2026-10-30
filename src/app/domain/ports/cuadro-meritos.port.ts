import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { CuadroMeritos, FiltrosCuadroMeritos } from '../models/cuadro-meritos.model';
import { ArchivoDescargado, FormatoDescargaCuadro } from '../models/reporte-descarga.model';

/**
 * Puerto de salida: Cuadro de Méritos de Jueces Superiores (RF007 — Submenú C).
 * Consulta y descargas reciben los mismos filtros para que coincidan.
 */
export interface CuadroMeritosPort {
  obtener(filtros: FiltrosCuadroMeritos): Observable<CuadroMeritos>;
  descargar(
    formato: FormatoDescargaCuadro,
    filtros: FiltrosCuadroMeritos
  ): Observable<ArchivoDescargado>;
}

export const CUADRO_MERITOS_PORT = new InjectionToken<CuadroMeritosPort>('CUADRO_MERITOS_PORT');
