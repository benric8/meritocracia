import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CuadroAntiguedadSuperiores,
  FiltrosCuadroAntiguedadSuperiores,
} from '../models/cuadro-antiguedad-superiores.model';
import { ArchivoDescargado, FormatoDescargaCuadro } from '../models/reporte-descarga.model';

/** Puerto de salida: Cuadro de Antigüedad de Jueces Superiores (RF007 — Submenú D). */
export interface CuadroAntiguedadSuperioresPort {
  obtener(filtros: FiltrosCuadroAntiguedadSuperiores): Observable<CuadroAntiguedadSuperiores>;
  descargar(
    formato: FormatoDescargaCuadro,
    filtros: FiltrosCuadroAntiguedadSuperiores
  ): Observable<ArchivoDescargado>;
}

export const CUADRO_ANTIGUEDAD_SUPERIORES_PORT =
  new InjectionToken<CuadroAntiguedadSuperioresPort>('CUADRO_ANTIGUEDAD_SUPERIORES_PORT');
