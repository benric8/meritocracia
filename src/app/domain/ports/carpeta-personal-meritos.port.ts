import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { CarpetaPersonalMeritos } from '../models/carpeta-personal-meritos.model';
import { ArchivoDescargado } from '../models/reporte-descarga.model';

/** Puerto de salida: Carpeta Personal de Méritos (RF007 — Submenú F, Anexo 05). */
export interface CarpetaPersonalMeritosPort {
  obtener(idFicha: string): Observable<CarpetaPersonalMeritos>;
  descargarPdf(idFicha: string): Observable<ArchivoDescargado>;
}

export const CARPETA_PERSONAL_MERITOS_PORT = new InjectionToken<CarpetaPersonalMeritosPort>(
  'CARPETA_PERSONAL_MERITOS_PORT'
);
