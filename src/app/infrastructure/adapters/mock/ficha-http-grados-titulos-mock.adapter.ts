import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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
import { EstudioIdioma } from '../../../domain/models/rubro-idioma.model';
import { PublicacionJuridica } from '../../../domain/models/rubro-publicacion-juridica.model';
import { Distincion } from '../../../domain/models/rubro-distincion.model';
import { DocenciaUniversitaria } from '../../../domain/models/rubro-docencia.model';
import { Demerito } from '../../../domain/models/rubro-demerito.model';
import { EstudioPosgrado } from '../../../domain/models/rubro-estudios-posgrado.model';
import { Pasantia } from '../../../domain/models/rubro-pasantias.model';
import { CursoEspecializacion } from '../../../domain/models/rubro-cursos-especializacion.model';
import { CertamenAcademico } from '../../../domain/models/rubro-certamenes-academicos.model';
import { AsistenciaEventoAcademico } from '../../../domain/models/rubro-asistencias-eventos.model';
import { EstudioOfimatica } from '../../../domain/models/rubro-ofimatica.model';
import { FichaPort } from '../../../domain/ports/ficha.port';
import { FichaHttpAdapter } from '../http/ficha-http.adapter';

/** Ficha real vía HTTP (rubros B, C y D). */
@Injectable({ providedIn: 'root' })
export class FichaHttpGradosTitulosMockAdapter implements FichaPort {
  private readonly http = inject(FichaHttpAdapter);

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
    return this.http.obtenerPorId(fichaId);
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
    return this.http.obtenerRubroAmag(fichaId);
  }

  upsertEstudioAmag(fichaId: string, item: EstudioAmag): Observable<FichaValoracion> {
    return this.http.upsertEstudioAmag(fichaId, item);
  }

  eliminarEstudioAmag(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarEstudioAmag(fichaId, itemId);
  }

  obtenerRubroIdioma(fichaId: string) {
    return this.http.obtenerRubroIdioma(fichaId);
  }

  upsertEstudioIdioma(fichaId: string, item: EstudioIdioma): Observable<FichaValoracion> {
    return this.http.upsertEstudioIdioma(fichaId, item);
  }

  eliminarEstudioIdioma(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarEstudioIdioma(fichaId, itemId);
  }

  obtenerRubroPublicacionJuridica(fichaId: string) {
    return this.http.obtenerRubroPublicacionJuridica(fichaId);
  }

  upsertPublicacionJuridica(fichaId: string, item: PublicacionJuridica): Observable<FichaValoracion> {
    return this.http.upsertPublicacionJuridica(fichaId, item);
  }

  eliminarPublicacionJuridica(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarPublicacionJuridica(fichaId, itemId);
  }

  obtenerRubroDistincion(fichaId: string) {
    return this.http.obtenerRubroDistincion(fichaId);
  }

  upsertDistincion(fichaId: string, item: Distincion): Observable<FichaValoracion> {
    return this.http.upsertDistincion(fichaId, item);
  }

  eliminarDistincion(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarDistincion(fichaId, itemId);
  }

  obtenerRubroDocencia(fichaId: string) {
    return this.http.obtenerRubroDocencia(fichaId);
  }

  upsertDocencia(fichaId: string, item: DocenciaUniversitaria): Observable<FichaValoracion> {
    return this.http.upsertDocencia(fichaId, item);
  }

  eliminarDocencia(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarDocencia(fichaId, itemId);
  }

  obtenerRubroDemerito(fichaId: string) {
    return this.http.obtenerRubroDemerito(fichaId);
  }

  upsertDemerito(fichaId: string, item: Demerito): Observable<FichaValoracion> {
    return this.http.upsertDemerito(fichaId, item);
  }

  eliminarDemerito(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarDemerito(fichaId, itemId);
  }

  obtenerRubroEstudiosPosgrado(fichaId: string) {
    return this.http.obtenerRubroEstudiosPosgrado(fichaId);
  }

  upsertEstudioPosgrado(
    fichaId: string,
    item: EstudioPosgrado
  ): Observable<FichaValoracion> {
    return this.http.upsertEstudioPosgrado(fichaId, item);
  }

  eliminarEstudioPosgrado(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarEstudioPosgrado(fichaId, itemId);
  }

  obtenerRubroPasantias(fichaId: string) {
    return this.http.obtenerRubroPasantias(fichaId);
  }

  upsertPasantia(fichaId: string, item: Pasantia): Observable<FichaValoracion> {
    return this.http.upsertPasantia(fichaId, item);
  }

  eliminarPasantia(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarPasantia(fichaId, itemId);
  }

  obtenerRubroCursosEspecializacion(fichaId: string) {
    return this.http.obtenerRubroCursosEspecializacion(fichaId);
  }

  upsertCursoEspecializacion(
    fichaId: string,
    item: CursoEspecializacion
  ): Observable<FichaValoracion> {
    return this.http.upsertCursoEspecializacion(fichaId, item);
  }

  eliminarCursoEspecializacion(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarCursoEspecializacion(fichaId, itemId);
  }

  obtenerRubroCertamenesAcademicos(fichaId: string) {
    return this.http.obtenerRubroCertamenesAcademicos(fichaId);
  }

  upsertCertamenAcademico(
    fichaId: string,
    item: CertamenAcademico
  ): Observable<FichaValoracion> {
    return this.http.upsertCertamenAcademico(fichaId, item);
  }

  eliminarCertamenAcademico(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarCertamenAcademico(fichaId, itemId);
  }

  obtenerRubroAsistenciasEventos(fichaId: string) {
    return this.http.obtenerRubroAsistenciasEventos(fichaId);
  }

  upsertAsistenciaEvento(
    fichaId: string,
    item: AsistenciaEventoAcademico
  ): Observable<FichaValoracion> {
    return this.http.upsertAsistenciaEvento(fichaId, item);
  }

  eliminarAsistenciaEvento(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarAsistenciaEvento(fichaId, itemId);
  }

  obtenerRubroOfimatica(fichaId: string) {
    return this.http.obtenerRubroOfimatica(fichaId);
  }

  upsertOfimatica(fichaId: string, item: EstudioOfimatica): Observable<FichaValoracion> {
    return this.http.upsertOfimatica(fichaId, item);
  }

  eliminarOfimatica(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.http.eliminarOfimatica(fichaId, itemId);
  }
}
