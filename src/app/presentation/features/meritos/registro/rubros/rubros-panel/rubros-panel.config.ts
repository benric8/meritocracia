import { ProviderToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ObtenerRubroAmagFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-amag-ficha.use-case';
import { ObtenerRubroAntiguedadFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-antiguedad-ficha.use-case';
import { ObtenerRubroAsistenciasEventosFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-asistencias-eventos-ficha.use-case';
import { ObtenerRubroCertamenesAcademicosFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-certamenes-academicos-ficha.use-case';
import { ObtenerRubroCursosEspecializacionFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-cursos-especializacion-ficha.use-case';
import { ObtenerRubroDemeritoFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-demerito-ficha.use-case';
import { ObtenerRubroDistincionFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-distincion-ficha.use-case';
import { ObtenerRubroDocenciaFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-docencia-ficha.use-case';
import { ObtenerRubroEstudiosPosgradoFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-estudios-posgrado-ficha.use-case';
import { ObtenerRubroGradosTitulosFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-grados-titulos-ficha.use-case';
import { ObtenerRubroIdiomaFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-idioma-ficha.use-case';
import { ObtenerRubroOfimaticaFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-ofimatica-ficha.use-case';
import { ObtenerRubroPasantiasFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-pasantias-ficha.use-case';
import { ObtenerRubroPublicacionJuridicaFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-publicacion-juridica-ficha.use-case';
import { DetalleError } from '../../../../../../domain/models/detalle-error.model';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import { RubroAmag } from '../../../../../../domain/models/rubro-amag.model';
import { RubroAntiguedad } from '../../../../../../domain/models/rubro-antiguedad.model';
import { RubroAsistenciasEventos } from '../../../../../../domain/models/rubro-asistencias-eventos.model';
import { RubroCertamenesAcademicos } from '../../../../../../domain/models/rubro-certamenes-academicos.model';
import { RubroCursosEspecializacion } from '../../../../../../domain/models/rubro-cursos-especializacion.model';
import { RubroDemerito } from '../../../../../../domain/models/rubro-demerito.model';
import { RubroDistincion } from '../../../../../../domain/models/rubro-distincion.model';
import { RubroDocencia } from '../../../../../../domain/models/rubro-docencia.model';
import { RubroEstudiosPosgrado } from '../../../../../../domain/models/rubro-estudios-posgrado.model';
import { RubroGradosTitulos } from '../../../../../../domain/models/rubro-grados-titulos.model';
import { RubroIdioma } from '../../../../../../domain/models/rubro-idioma.model';
import { RubroOfimatica } from '../../../../../../domain/models/rubro-ofimatica.model';
import { RubroPasantias } from '../../../../../../domain/models/rubro-pasantias.model';
import { RubroPublicacionJuridica } from '../../../../../../domain/models/rubro-publicacion-juridica.model';

/**
 * Configuración de los rubros con detalle del panel: lo único que distingue a cada uno.
 * El panel usa esta tabla con métodos genéricos en vez de repetir el mismo código por rubro.
 *
 * Para agregar un rubro: sumarlo a `RubrosPorCodigo`, a la lista que corresponda
 * (`CODIGOS_RUBRO_DIRECTO` o `CODIGOS_SUBRUBRO_E`) y a `CONFIG_RUBROS`.
 */

/** Modelo de detalle de cada rubro, por su código en el catálogo maestro. */
export interface RubrosPorCodigo {
  B: RubroAntiguedad;
  C: RubroGradosTitulos;
  D: RubroAmag;
  F: RubroIdioma;
  G: RubroPublicacionJuridica;
  H: RubroDistincion;
  I: RubroDocencia;
  J: RubroDemerito;
  E1: RubroEstudiosPosgrado;
  E2: RubroPasantias;
  E3: RubroCursosEspecializacion;
  E4: RubroCertamenesAcademicos;
  E5: RubroAsistenciasEventos;
  E6: RubroOfimatica;
}

export type CodigoRubro = keyof RubrosPorCodigo;

/** Rubros que se cargan al abrir su propio panel. */
export const CODIGOS_RUBRO_DIRECTO = ['B', 'C', 'D', 'F', 'G', 'H', 'I', 'J'] as const;

/** Subrubros de E: se cargan todos al abrir el rubro E. */
export const CODIGOS_SUBRUBRO_E = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'] as const;

export const CODIGOS_RUBRO: readonly CodigoRubro[] = [
  ...CODIGOS_RUBRO_DIRECTO,
  ...CODIGOS_SUBRUBRO_E,
];

export function esCodigoRubro(codigo: string): codigo is CodigoRubro {
  return (CODIGOS_RUBRO as readonly string[]).includes(codigo);
}

/** Forma común del resultado de los casos de uso `ObtenerRubro…FichaUseCase`. */
export type ResultadoCargaRubro<T> =
  | { exito: true; rubro: T }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

export interface CargadorRubro<T> {
  ejecutar(fichaId: string): Observable<ResultadoCargaRubro<T>>;
}

export interface ConfigRubro<T> {
  /** Caso de uso que trae el detalle del rubro. */
  cargador: ProviderToken<CargadorRubro<T>>;
  /** Texto mientras carga (solo los rubros con panel propio lo muestran). */
  textoCarga?: string;
  /** Detalle del rubro dentro de la ficha. */
  deFicha: (ficha: FichaValoracion) => T | null;
  /** Puntaje del rubro; `0` si no hay detalle. */
  puntaje: (rubro: T | null) => number;
  /** Copia del rubro con el puntaje oficial del backend. */
  conPuntaje: (rubro: T, puntaje: number) => T;
  /**
   * Si al actualizarse la ficha se reemplaza el detalle mostrado.
   * B no: su componente maneja la titularidad y los periodos por su cuenta.
   */
  datosDesdeFicha: boolean;
}

type ConfigRubros = { readonly [K in CodigoRubro]: ConfigRubro<RubrosPorCodigo[K]> };

/** Puntaje y copia para los rubros que guardan el total en `puntajeTotal` (todos menos B). */
function conPuntajeTotal<T extends { puntajeTotal: number }>(
  cargador: ProviderToken<CargadorRubro<T>>,
  deFicha: (ficha: FichaValoracion) => T | null,
  textoCarga?: string
): ConfigRubro<T> {
  return {
    cargador,
    textoCarga,
    deFicha,
    puntaje: (rubro) => rubro?.puntajeTotal ?? 0,
    conPuntaje: (rubro, puntaje) => ({ ...rubro, puntajeTotal: puntaje }),
    datosDesdeFicha: true,
  };
}

export const CONFIG_RUBROS: ConfigRubros = {
  B: {
    cargador: ObtenerRubroAntiguedadFichaUseCase,
    textoCarga: 'Cargando antigüedad registrada…',
    deFicha: (ficha) => ficha.rubroAntiguedad,
    // B es distinto: el puntaje está en la titularidad.
    puntaje: (rubro) => rubro?.titularidad.puntaje ?? 0,
    conPuntaje: (rubro, puntaje) => ({
      ...rubro,
      titularidad: { ...rubro.titularidad, puntaje },
    }),
    datosDesdeFicha: false,
  },
  C: conPuntajeTotal(
    ObtenerRubroGradosTitulosFichaUseCase,
    (ficha) => ficha.rubroGradosTitulos,
    'Cargando grados registrados…'
  ),
  D: conPuntajeTotal(
    ObtenerRubroAmagFichaUseCase,
    (ficha) => ficha.rubroAmag,
    'Cargando estudios AMAG registrados…'
  ),
  F: conPuntajeTotal(
    ObtenerRubroIdiomaFichaUseCase,
    (ficha) => ficha.rubroIdioma,
    'Cargando estudios de idioma registrados…'
  ),
  G: conPuntajeTotal(
    ObtenerRubroPublicacionJuridicaFichaUseCase,
    (ficha) => ficha.rubroPublicacionJuridica,
    'Cargando publicaciones jurídicas registradas…'
  ),
  H: conPuntajeTotal(
    ObtenerRubroDistincionFichaUseCase,
    (ficha) => ficha.rubroDistincion,
    'Cargando distinciones registradas…'
  ),
  I: conPuntajeTotal(
    ObtenerRubroDocenciaFichaUseCase,
    (ficha) => ficha.rubroDocencia,
    'Cargando docencia registrada…'
  ),
  J: conPuntajeTotal(
    ObtenerRubroDemeritoFichaUseCase,
    (ficha) => ficha.rubroDemerito,
    'Cargando deméritos registrados…'
  ),
  E1: conPuntajeTotal(ObtenerRubroEstudiosPosgradoFichaUseCase, (f) => f.rubroEstudiosPosgrado),
  E2: conPuntajeTotal(ObtenerRubroPasantiasFichaUseCase, (f) => f.rubroPasantias),
  E3: conPuntajeTotal(
    ObtenerRubroCursosEspecializacionFichaUseCase,
    (f) => f.rubroCursosEspecializacion
  ),
  E4: conPuntajeTotal(
    ObtenerRubroCertamenesAcademicosFichaUseCase,
    (f) => f.rubroCertamenesAcademicos
  ),
  E5: conPuntajeTotal(ObtenerRubroAsistenciasEventosFichaUseCase, (f) => f.rubroAsistenciasEventos),
  E6: conPuntajeTotal(ObtenerRubroOfimaticaFichaUseCase, (f) => f.rubroOfimatica),
};

/**
 * Configuración de un rubro sin su tipo concreto, para el código genérico del panel
 * (que recorre todos los rubros a la vez).
 */
export function configRubro(codigo: CodigoRubro): ConfigRubro<unknown> {
  return CONFIG_RUBROS[codigo] as unknown as ConfigRubro<unknown>;
}
