import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ActualizarDatosPersonalesFicha,
  CrearBorradorFicha,
  FichaValoracion,
  ResultadoResolverFicha,
} from '../models/ficha-valoracion.model';
import {
  Colegiatura,
  PeriodoNivelAnterior,
  Provisionalidad,
  RubroAntiguedad,
  TitularidadActual,
} from '../models/rubro-antiguedad.model';
import { GradoTitulo, RubroGradosTitulos } from '../models/rubro-grados-titulos.model';

/**
 * Puerto de salida: ciclo de vida de la ficha de valoración (RF006).
 * Persistencia por unidades (cabecera + rubro B en esta fase).
 */
export interface FichaPort {
  resolverDelCiclo(dni: string, fechaValoracionId: string): Observable<ResultadoResolverFicha>;

  crearBorrador(peticion: CrearBorradorFicha): Observable<FichaValoracion>;

  actualizarDatosPersonales(
    fichaId: string,
    peticion: ActualizarDatosPersonalesFicha
  ): Observable<FichaValoracion>;

  obtenerPorId(fichaId: string): Observable<FichaValoracion>;

  obtenerRubroAntiguedad(fichaId: string): Observable<RubroAntiguedad>;

  guardarTitularidad(
    fichaId: string,
    data: TitularidadActual,
    antiguedadId?: string | null
  ): Observable<FichaValoracion>;

  guardarPeriodoNivelAnterior(
    fichaId: string,
    data: PeriodoNivelAnterior
  ): Observable<FichaValoracion>;

  upsertProvisionalidad(fichaId: string, item: Provisionalidad): Observable<FichaValoracion>;

  eliminarProvisionalidad(fichaId: string, itemId: string): Observable<FichaValoracion>;

  upsertColegiatura(fichaId: string, item: Colegiatura): Observable<FichaValoracion>;

  eliminarColegiatura(fichaId: string, itemId: string): Observable<FichaValoracion>;

  obtenerRubroGradosTitulos(fichaId: string): Observable<RubroGradosTitulos>;

  upsertGradoTitulo(fichaId: string, item: GradoTitulo): Observable<FichaValoracion>;

  eliminarGradoTitulo(fichaId: string, itemId: string): Observable<FichaValoracion>;
}

export const FICHA_PORT = new InjectionToken<FichaPort>('FICHA_PORT');
