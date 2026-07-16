import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CalculoTiempoTitularParams,
  TiempoServicio,
} from '../models/tiempo-servicio.model';

/**
 * Puerto de salida: cálculos de antigüedad / tiempos de servicio (RF006 — rubro B).
 * En producción lo resolverá el backend; el mock simula la latencia y la lógica.
 */
export interface AntiguedadPort {
  calcularTiempo(inicio: string, fin: string): Observable<TiempoServicio>;

  calcularTiempoTitular(params: CalculoTiempoTitularParams): Observable<TiempoServicio>;

  calcularPuntajePorAnios(tiempo: TiempoServicio): Observable<number>;

  calcularAniosColegiatura(
    fechaColegiatura: string,
    fechaValoracion: string
  ): Observable<number>;

  sumarTiempos(tiempos: TiempoServicio[]): Observable<TiempoServicio>;
}

export const ANTIGUEDAD_PORT = new InjectionToken<AntiguedadPort>('ANTIGUEDAD_PORT');
