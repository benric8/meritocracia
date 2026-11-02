import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { FichaValoracionMeritos } from '../models/ficha-valoracion-meritos.model';
import { ArchivoDescargado } from '../models/reporte-descarga.model';

/** Puerto de salida: Ficha de Valoración de Méritos (RF007 — Submenú E, Anexo 04). */
export interface FichaValoracionMeritosPort {
  obtener(idFicha: string): Observable<FichaValoracionMeritos>;
  descargarPdf(idFicha: string): Observable<ArchivoDescargado>;
}

export const FICHA_VALORACION_MERITOS_PORT = new InjectionToken<FichaValoracionMeritosPort>(
  'FICHA_VALORACION_MERITOS_PORT'
);
