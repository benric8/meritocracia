import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CalculoEdadJuez,
  DatosSigaJuez,
  EdadJuez,
} from '../models/datos-siga-juez.model';

/**
 * Puerto de salida: datos del juez vía SIGA y cálculos asociados (RF006).
 */
export interface JuezPort {
  obtenerDatosSiga(dni: string): Observable<DatosSigaJuez>;
  calcularEdad(peticion: CalculoEdadJuez): Observable<EdadJuez>;
}

export const JUEZ_PORT = new InjectionToken<JuezPort>('JUEZ_PORT');
