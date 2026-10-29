import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ArchivoDescargado,
  CuadroAntiguedad,
  FormatoDescargaCuadro,
} from '../models/cuadro-antiguedad.model';

/**
 * Puerto de salida: Cuadro de Antigüedad de Jueces Supremos (RF007 — Submenú B).
 * Sin `idFechaValoracion` el backend usa la fecha de valoración activa.
 */
export interface CuadroAntiguedadPort {
  obtener(idFechaValoracion?: string): Observable<CuadroAntiguedad>;
  descargar(
    formato: FormatoDescargaCuadro,
    idFechaValoracion?: string
  ): Observable<ArchivoDescargado>;
}

export const CUADRO_ANTIGUEDAD_PORT = new InjectionToken<CuadroAntiguedadPort>(
  'CUADRO_ANTIGUEDAD_PORT'
);
