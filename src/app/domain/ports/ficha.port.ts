import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ActualizarDatosPersonalesFicha,
  CrearBorradorFicha,
  FichaValoracion,
  ResultadoResolverFicha,
} from '../models/ficha-valoracion.model';

/**
 * Puerto de salida: ciclo de vida de la ficha de valoración (RF006).
 * Persistencia por unidades; esta Fase 1 cubre cabecera / borrador.
 * En producción lo resuelve el backend; el mock simula latencia y reglas.
 */
export interface FichaPort {
  /**
   * Determina si el juez tiene ficha en el ciclo vigente o solo en ciclos pasados.
   */
  resolverDelCiclo(dni: string, fechaValoracionId: string): Observable<ResultadoResolverFicha>;

  crearBorrador(peticion: CrearBorradorFicha): Observable<FichaValoracion>;

  actualizarDatosPersonales(
    fichaId: string,
    peticion: ActualizarDatosPersonalesFicha
  ): Observable<FichaValoracion>;

  obtenerPorId(fichaId: string): Observable<FichaValoracion>;
}

export const FICHA_PORT = new InjectionToken<FichaPort>('FICHA_PORT');
