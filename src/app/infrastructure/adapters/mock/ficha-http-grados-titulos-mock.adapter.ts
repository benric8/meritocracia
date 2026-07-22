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
import { EstudioAmag } from '../../../domain/models/rubro-amag.model';
import { FichaPort } from '../../../domain/ports/ficha.port';
import { FichaHttpAdapter } from '../http/ficha-http.adapter';
import { FichaAmagMockAdapter } from './ficha-amag-mock.adapter';
/**
 * Ficha real vía HTTP; rubro D (AMAG) mock hasta que el backend esté listo.
 */
@Injectable({ providedIn: 'root' })
export class FichaHttpGradosTitulosMockAdapter implements FichaPort {
  private readonly http = inject(FichaHttpAdapter);
  private readonly amagMock = inject(FichaAmagMockAdapter);

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
        this.amagMock.obtenerRubroAmag(fichaId).pipe(
          map((rubroAmag) => ({
            ...ficha,
            rubroAmag,
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
    return this.http.obtenerRubroGradosTitulos(fichaId);
  }

  upsertGradoTitulo(fichaId: string, item: GradoTitulo): Observable<FichaValoracion> {
    return this.http.upsertGradoTitulo(fichaId, item);
  }

  eliminarGradoTitulo(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarGradoTitulo(fichaId, itemId);
  }

  obtenerRubroAmag(fichaId: string) {
    return this.amagMock.obtenerRubroAmag(fichaId);
  }

  upsertEstudioAmag(fichaId: string, item: EstudioAmag): Observable<FichaValoracion> {
    return this.amagMock.upsertEstudioAmag(fichaId, item).pipe(
      switchMap((rubro) => this.fusionarRubroAmagEnFicha(fichaId, rubro))
    );
  }

  eliminarEstudioAmag(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.amagMock.eliminarEstudioAmag(fichaId, itemId).pipe(
      switchMap((rubro) => this.fusionarRubroAmagEnFicha(fichaId, rubro))
    );
  }

  private fusionarRubroAmagEnFicha(
    fichaId: string,
    rubro: NonNullable<FichaValoracion['rubroAmag']>
  ): Observable<FichaValoracion> {
    return this.fusionarRubroEnFicha(fichaId, { rubroAmag: rubro });
  }

  private fusionarRubroEnFicha(
    fichaId: string,
    parcial: Partial<Pick<FichaValoracion, 'rubroAmag'>>
  ): Observable<FichaValoracion> {
    return this.http.obtenerPorId(fichaId).pipe(
      map((ficha) => ({
        ...ficha,
        ...parcial,
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
          rubroGradosTitulos: null,
          rubroAmag: parcial.rubroAmag ?? null,
          puntajeTotal: parcial.rubroAmag?.puntajeTotal ?? 0,
          creadoEn: new Date().toISOString(),
          actualizadoEn: new Date().toISOString(),
        })
      )
    );
  }
}
