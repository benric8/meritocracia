import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { FechaValoracion, NuevaFechaValoracion } from '../models/fecha-valoracion.model';

/**
 * Puerto de salida: configuración de fecha de valoración (RF006 — Administrador).
 */
export interface FechaValoracionPort {
  obtenerVigente(): Observable<FechaValoracion | null>;
  listarHistorial(): Observable<FechaValoracion[]>;
  registrar(peticion: NuevaFechaValoracion, usuario: string): Observable<FechaValoracion>;
  desactivar(id: string): Observable<void>;
}

export const FECHA_VALORACION_PORT = new InjectionToken<FechaValoracionPort>(
  'FECHA_VALORACION_PORT'
);
