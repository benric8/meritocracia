import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import {
  ActualizarDatosPersonalesFicha,
  CrearBorradorFicha,
  FichaValoracion,
  ResultadoResolverFicha,
} from '../../../domain/models/ficha-valoracion.model';
import {
  Colegiatura,
  PeriodoNivelAnterior,
  Provisionalidad,
  RubroAntiguedad,
  TitularidadActual,
} from '../../../domain/models/rubro-antiguedad.model';
import { GradoTitulo } from '../../../domain/models/rubro-grados-titulos.model';
import { FichaPort } from '../../../domain/ports/ficha.port';
import { FichaHttpAdapter } from '../http/ficha-http.adapter';
import { FichaGradosTitulosMockAdapter } from './ficha-grados-titulos-mock.adapter';

/**
 * Ficha real vía HTTP; rubro C (grados y títulos) mock hasta que el backend esté listo.
 * Sustituir por `FichaHttpAdapter` cuando `ficha-grados-titulos` esté disponible.
 */
@Injectable({ providedIn: 'root' })
export class FichaHttpGradosTitulosMockAdapter implements FichaPort {
  private readonly http = inject(FichaHttpAdapter);
  private readonly gradosMock = inject(FichaGradosTitulosMockAdapter);

  resolverDelCiclo(dni: string, fechaValoracionId: string): Observable<ResultadoResolverFicha> {
    return this.http.resolverDelCiclo(dni, fechaValoracionId);
  }

  crearBorrador(peticion: CrearBorradorFicha): Observable<FichaValoracion> {
    return this.http.crearBorrador(peticion);
  }

  actualizarDatosPersonales(
    fichaId: string,
    peticion: ActualizarDatosPersonalesFicha
  ): Observable<FichaValoracion> {
    return this.http.actualizarDatosPersonales(fichaId, peticion);
  }

  obtenerPorId(fichaId: string): Observable<FichaValoracion> {
    return this.http.obtenerPorId(fichaId).pipe(
      switchMap((ficha) =>
        this.gradosMock.obtenerRubroGradosTitulos(fichaId).pipe(
          map((rubro) => ({
            ...ficha,
            rubroGradosTitulos: rubro,
          }))
        )
      )
    );
  }

  obtenerRubroAntiguedad(fichaId: string): Observable<RubroAntiguedad> {
    return this.http.obtenerRubroAntiguedad(fichaId);
  }

  guardarTitularidad(
    fichaId: string,
    data: TitularidadActual,
    antiguedadId?: string | null
  ): Observable<FichaValoracion> {
    return this.http.guardarTitularidad(fichaId, data, antiguedadId);
  }

  guardarPeriodoNivelAnterior(
    fichaId: string,
    data: PeriodoNivelAnterior
  ): Observable<FichaValoracion> {
    return this.http.guardarPeriodoNivelAnterior(fichaId, data);
  }

  upsertProvisionalidad(fichaId: string, item: Provisionalidad): Observable<FichaValoracion> {
    return this.http.upsertProvisionalidad(fichaId, item);
  }

  eliminarProvisionalidad(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarProvisionalidad(fichaId, itemId);
  }

  upsertColegiatura(fichaId: string, item: Colegiatura): Observable<FichaValoracion> {
    return this.http.upsertColegiatura(fichaId, item);
  }

  eliminarColegiatura(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarColegiatura(fichaId, itemId);
  }

  obtenerRubroGradosTitulos(fichaId: string) {
    return this.gradosMock.obtenerRubroGradosTitulos(fichaId);
  }

  upsertGradoTitulo(fichaId: string, item: GradoTitulo): Observable<FichaValoracion> {
    return this.gradosMock.upsertGradoTitulo(fichaId, item).pipe(
      switchMap((rubro) => this.fusionarRubroEnFicha(fichaId, rubro))
    );
  }

  eliminarGradoTitulo(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.gradosMock.eliminarGradoTitulo(fichaId, itemId).pipe(
      switchMap((rubro) => this.fusionarRubroEnFicha(fichaId, rubro))
    );
  }

  private fusionarRubroEnFicha(
    fichaId: string,
    rubro: NonNullable<FichaValoracion['rubroGradosTitulos']>
  ): Observable<FichaValoracion> {
    return this.http.obtenerPorId(fichaId).pipe(
      map((ficha) => ({
        ...ficha,
        rubroGradosTitulos: rubro,
        actualizadoEn: new Date().toISOString(),
      })),
      catchError(() =>
        of({
          id: fichaId,
          estado: 'BORRADOR' as const,
          nivelId: '',
          nivelNombre: '',
          fechaValoracionId: '',
          fechaValoracionSnapshot: '',
          datosPersonales: {
            dni: '',
            nombreCompleto: '',
            foto: '',
            fechaNacimiento: '',
            sexo: 'M' as const,
            edad: null,
          },
          fichaPreviaId: null,
          rubroAntiguedad: null,
          rubroGradosTitulos: rubro,
          puntajeTotal: rubro.puntajeTotal,
          creadoEn: new Date().toISOString(),
          actualizadoEn: new Date().toISOString(),
        })
      )
    );
  }
}
