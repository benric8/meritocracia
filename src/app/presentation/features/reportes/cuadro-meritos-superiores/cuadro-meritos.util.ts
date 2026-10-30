import { FilaCuadroMeritos } from '../../../../domain/models/cuadro-meritos.model';

const SIN_DATO = '-';

type CampoPuntaje = {
  [K in keyof FilaCuadroMeritos]: FilaCuadroMeritos[K] extends number ? K : never;
}[keyof FilaCuadroMeritos];

/** Columnas de puntaje del Anexo 02, de II. ANTIGÜEDAD a CRITERIO II, en orden. */
const COLUMNAS_PUNTAJE: ReadonlyArray<{ campo: CampoPuntaje; finGrupo?: boolean; total?: boolean }> =
  [
    { campo: 'puntajeAntiguedad' },
    { campo: 'puntajeGradosTitulos' },
    { campo: 'puntajeEstudiosAmag', finGrupo: true },
    { campo: 'puntajeDoctoradoMaestria' },
    { campo: 'puntajePasantias' },
    { campo: 'puntajeCursos' },
    { campo: 'puntajeExpositor' },
    { campo: 'puntajeAsistenciaEventos' },
    { campo: 'puntajeOfimatica' },
    { campo: 'puntajeIdiomas' },
    { campo: 'puntajePerfeccionamiento', finGrupo: true, total: true },
    { campo: 'puntajePublicaciones' },
    { campo: 'puntajeDistinciones' },
    { campo: 'puntajeDocencia' },
    { campo: 'puntajeDemeritos' },
    { campo: 'puntajeTotal', finGrupo: true, total: true },
    { campo: 'criterioI' },
    { campo: 'criterioII' },
  ];

export interface CeldaPuntaje {
  campo: CampoPuntaje;
  valor: string;
  negativo: boolean;
  finGrupo: boolean;
  total: boolean;
}

/** Fila lista para pintar: mismas reglas de formato que el Excel y el PDF del Anexo 02. */
export interface FilaCuadroMeritosVista {
  clave: string;
  orden: string;
  apellidosNombres: string;
  cesante: boolean;
  distritoJudicial: string;
  primeraEspecialidad: string;
  segundaEspecialidad: string;
  puntajes: CeldaPuntaje[];
  criterioIII: string;
}

/**
 * Siempre tres decimales con punto (`12` → `12.000`, `-0.5` → `-0.500`).
 * Sin `toLocaleString`: en es-PE el punto se leería como separador de miles.
 */
export function formatearPuntaje(valor: number | null | undefined): string {
  return (valor ?? 0).toFixed(3);
}

export function aFilaCuadroMeritosVista(fila: FilaCuadroMeritos): FilaCuadroMeritosVista {
  return {
    clave: fila.idFichaValoracion || fila.idMagistrado || String(fila.orden),
    orden: `${fila.orden}º`,
    apellidosNombres: fila.apellidosNombres,
    cesante: fila.cesante,
    distritoJudicial: fila.distritoJudicial ?? SIN_DATO,
    primeraEspecialidad: fila.primeraEspecialidad ?? SIN_DATO,
    segundaEspecialidad: fila.segundaEspecialidad ?? SIN_DATO,
    puntajes: COLUMNAS_PUNTAJE.map(({ campo, finGrupo = false, total = false }) => ({
      campo,
      valor: formatearPuntaje(fila[campo]),
      negativo: fila[campo] < 0,
      finGrupo,
      total,
    })),
    criterioIII: fila.criterioIII == null ? SIN_DATO : String(fila.criterioIII),
  };
}
