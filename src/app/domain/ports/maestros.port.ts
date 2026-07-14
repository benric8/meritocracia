import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { NivelTitular } from '../models/nivel-titular.model';

/**
 * Puerto de salida: catálogos maestros (RF006 — ficha de valoración).
 */
export interface MaestrosPort {
  listarNivelesTitular(): Observable<NivelTitular[]>;
}

export const MAESTROS_PORT = new InjectionToken<MaestrosPort>('MAESTROS_PORT');
