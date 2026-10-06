import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoItem } from '../models/catalogo-item.model';
import { IdiomaCatalogoItem, TipoIdioma } from '../models/rubro-idioma.model';
import { NivelTitular } from '../models/nivel-titular.model';
import { RubroMaestro } from '../models/rubro-maestro.model';
import { SubrubroMaestro } from '../models/subrubro-maestro.model';
import { TipoDistincionCatalogoItem } from '../models/rubro-distincion.model';
import { TipoPasantiaCatalogo } from '../models/rubro-pasantias.model';
import { TipoCursoEspecializacionCatalogo } from '../models/rubro-cursos-especializacion.model';
import { CatalogoCertamen } from '../models/rubro-certamenes-academicos.model';
import { NivelOfimaticaCatalogo } from '../models/rubro-ofimatica.model';

/**
 * Puerto de salida: catálogos maestros (RF006 — ficha de valoración).
 * Los catálogos de cargo dependen del cargo de magistrado seleccionado en cabecera.
 */
export interface MaestrosPort {
  listarNivelesTitular(): Observable<NivelTitular[]>;
  listarDistritosJudiciales(): Observable<CatalogoItem[]>;
  /** Cargo titular actual según `cargoMagistradoId` de la ficha. */
  listarCargosTitular(cargoMagistradoId: string): Observable<CatalogoItem[]>;
  /** Cargo de provisionalidad según el cargo de magistrado de la ficha. */
  listarCargosProvisional(cargoMagistradoId: string): Observable<CatalogoItem[]>;
  listarEspecialidades(): Observable<CatalogoItem[]>;
  /** Cargo/nivel inmediato anterior según el cargo de magistrado de la ficha. */
  listarNivelesInmediatosAnteriores(cargoMagistradoId: string): Observable<CatalogoItem[]>;
  listarColegiosAbogados(): Observable<CatalogoItem[]>;
  listarNivelesGrado(): Observable<CatalogoItem[]>;
  listarUniversidades(): Observable<CatalogoItem[]>;
  /** Autocompletado de universidades (mínimo 2 caracteres en `termino`). */
  buscarUniversidades(
    termino: string,
    paisId?: string,
    limite?: number
  ): Observable<CatalogoItem[]>;
  listarPaises(): Observable<CatalogoItem[]>;
  /** Tipos de pasantía del subrubro E.2. El orden lo define el API. */
  listarTiposPasantia(): Observable<TipoPasantiaCatalogo[]>;
  /** Tipos de curso del subrubro E.3. El orden lo define el API. */
  listarTiposCursoEspecializacion(): Observable<TipoCursoEspecializacionCatalogo[]>;
  /** Tipos de certamen del subrubro E.4. El orden lo define el API. */
  listarEventos(): Observable<CatalogoCertamen[]>;
  /** Modalidades del subrubro E.4. El orden lo define el API. */
  listarModalidades(): Observable<CatalogoCertamen[]>;
  /** Participación del subrubro E.4. El orden lo define el API. */
  listarTiposParticipacionCertamen(): Observable<CatalogoCertamen[]>;
  /**
   * Autocompletado de instituciones del subrubro E.2.
   * Mínimo 2 caracteres. `paisId` es opcional. `limite` máximo 50.
   */
  buscarInstituciones(
    termino: string,
    paisId?: string,
    limite?: number
  ): Observable<CatalogoItem[]>;
  listarTiposCursoAmag(): Observable<CatalogoItem[]>;
  listarIdiomas(tipo?: TipoIdioma): Observable<IdiomaCatalogoItem[]>;
  listarNivelesIdioma(): Observable<CatalogoItem[]>;
  listarTiposDocumentoIdioma(): Observable<CatalogoItem[]>;
  /** Autocompletado de instituciones para rubro F (`tipo_institucion_id = 2`). */
  buscarInstitucionesIdioma(termino: string): Observable<CatalogoItem[]>;
  /** Autocompletado de universidades para rubro I (`tipo_institucion_id = 1`). Se envía el nombre. */
  buscarInstitucionesUniversitarias(termino: string): Observable<CatalogoItem[]>;
  listarTiposPublicacion(): Observable<CatalogoItem[]>;
  listarTiposDocumentoDistincion(): Observable<CatalogoItem[]>;
  /** Niveles del subrubro E.6. El orden lo define el API. */
  listarNivelesOfimatica(): Observable<NivelOfimaticaCatalogo[]>;
  listarTiposDistincion(): Observable<TipoDistincionCatalogoItem[]>;
  listarRubros(): Observable<RubroMaestro[]>;
  listarSubrubros(idRubro: number): Observable<SubrubroMaestro[]>;
}

export const MAESTROS_PORT = new InjectionToken<MaestrosPort>('MAESTROS_PORT');
