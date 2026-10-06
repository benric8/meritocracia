import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { TipoPasantiaCatalogo } from '../../../domain/models/rubro-pasantias.model';
import { TipoCursoEspecializacionCatalogo } from '../../../domain/models/rubro-cursos-especializacion.model';
import { CatalogoCertamen } from '../../../domain/models/rubro-certamenes-academicos.model';
import { NivelOfimaticaCatalogo } from '../../../domain/models/rubro-ofimatica.model';
import { TipoIdioma } from '../../../domain/models/rubro-idioma.model';
import { NivelTitular } from '../../../domain/models/nivel-titular.model';
import { RubroMaestro } from '../../../domain/models/rubro-maestro.model';
import { SubrubroMaestro } from '../../../domain/models/subrubro-maestro.model';
import { MaestrosPort } from '../../../domain/ports/maestros.port';
import { MaestrosHttpAdapter } from '../http/maestros-http.adapter';

/**
 * Maestros reales vía HTTP (incluye catálogo de cursos AMAG).
 */
@Injectable({ providedIn: 'root' })
export class MaestrosHttpGradosTitulosMockAdapter implements MaestrosPort {
  private readonly http = inject(MaestrosHttpAdapter);

  listarNivelesTitular(): Observable<NivelTitular[]> {
    return this.http.listarNivelesTitular();
  }

  listarDistritosJudiciales(): Observable<CatalogoItem[]> {
    return this.http.listarDistritosJudiciales();
  }

  listarCargosTitular(cargoMagistradoId: string): Observable<CatalogoItem[]> {
    return this.http.listarCargosTitular(cargoMagistradoId);
  }

  listarCargosProvisional(cargoMagistradoId: string): Observable<CatalogoItem[]> {
    return this.http.listarCargosProvisional(cargoMagistradoId);
  }

  listarEspecialidades(): Observable<CatalogoItem[]> {
    return this.http.listarEspecialidades();
  }

  listarNivelesInmediatosAnteriores(cargoMagistradoId: string): Observable<CatalogoItem[]> {
    return this.http.listarNivelesInmediatosAnteriores(cargoMagistradoId);
  }

  listarColegiosAbogados(): Observable<CatalogoItem[]> {
    return this.http.listarColegiosAbogados();
  }

  listarNivelesGrado(): Observable<CatalogoItem[]> {
    return this.http.listarNivelesGrado();
  }

  listarUniversidades(): Observable<CatalogoItem[]> {
    return this.http.listarUniversidades();
  }

  buscarUniversidades(
    termino: string,
    paisId?: string,
    limite?: number
  ): Observable<CatalogoItem[]> {
    return this.http.buscarUniversidades(termino, paisId, limite);
  }

  listarPaises(): Observable<CatalogoItem[]> {
    return this.http.listarPaises();
  }

  listarTiposPasantia(): Observable<TipoPasantiaCatalogo[]> {
    return this.http.listarTiposPasantia();
  }

  listarTiposCursoEspecializacion(): Observable<TipoCursoEspecializacionCatalogo[]> {
    return this.http.listarTiposCursoEspecializacion();
  }

  listarEventos(): Observable<CatalogoCertamen[]> {
    return this.http.listarEventos();
  }

  listarModalidades(): Observable<CatalogoCertamen[]> {
    return this.http.listarModalidades();
  }

  listarTiposParticipacionCertamen(): Observable<CatalogoCertamen[]> {
    return this.http.listarTiposParticipacionCertamen();
  }

  buscarInstituciones(
    termino: string,
    paisId?: string,
    limite?: number
  ): Observable<CatalogoItem[]> {
    return this.http.buscarInstituciones(termino, paisId, limite);
  }

  listarTiposCursoAmag(): Observable<CatalogoItem[]> {
    return this.http.listarTiposCursoAmag();
  }

  listarIdiomas(tipo?: TipoIdioma) {
    return this.http.listarIdiomas(tipo);
  }

  listarNivelesIdioma(): Observable<CatalogoItem[]> {
    return this.http.listarNivelesIdioma();
  }

  listarTiposDocumentoIdioma(): Observable<CatalogoItem[]> {
    return this.http.listarTiposDocumentoIdioma();
  }

  buscarInstitucionesIdioma(termino: string): Observable<CatalogoItem[]> {
    return this.http.buscarInstitucionesIdioma(termino);
  }

  buscarInstitucionesUniversitarias(termino: string): Observable<CatalogoItem[]> {
    return this.http.buscarInstitucionesUniversitarias(termino);
  }

  listarTiposPublicacion(): Observable<CatalogoItem[]> {
    return this.http.listarTiposPublicacion();
  }

  listarTiposDocumentoDistincion(): Observable<CatalogoItem[]> {
    return this.http.listarTiposDocumentoDistincion();
  }

  listarNivelesOfimatica(): Observable<NivelOfimaticaCatalogo[]> {
    return this.http.listarNivelesOfimatica();
  }

  listarTiposDistincion() {
    return this.http.listarTiposDistincion();
  }

  listarRubros(): Observable<RubroMaestro[]> {
    return this.http.listarRubros();
  }

  listarSubrubros(idRubro: number): Observable<SubrubroMaestro[]> {
    return this.http.listarSubrubros(idRubro);
  }
}
