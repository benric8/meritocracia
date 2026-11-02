import { TiempoAntiguedad } from '../../../../domain/models/cuadro-antiguedad.model';
import {
  AntiguedadFichaMeritos,
  FichaValoracionMeritos,
  IndicadorFichaMeritos,
  RubroFichaMeritos,
} from '../../../../domain/models/ficha-valoracion-meritos.model';
import { formatearFechaCuadro } from '../cuadro-antiguedad-supremos/cuadro-antiguedad.util';
import { formatearPuntaje } from '../cuadro-meritos-superiores/cuadro-meritos.util';

const SIN_DATO = '—';
const RUBRO_PRODUCCION = 'I';
const RUBRO_ANTIGUEDAD = 'II';
const RUBRO_DEMERITOS = 'IX';
/** Rubros con tabla de detalle; los demás (VI al IX) se resumen en tarjetas pequeñas. */
const RUBROS_DETALLADOS = ['II', 'III', 'IV', 'V'];
const SIGLAS = new Set(['AMAG', 'PROFA', 'CE-PJ', 'PJ', 'CSJ']);

export interface PuntajeVista {
  valor: string;
  /** `12`, `1.5` (sin ceros sobrantes); vacío si no hay tope. */
  maximo: string;
  negativo: boolean;
}

export interface IndicadorVista {
  clave: string;
  descripcion: string;
  cuenta: boolean;
  detalle: string;
  puntaje: PuntajeVista;
  /** Sin puntaje: la fila se atenúa. */
  vacio: boolean;
}

export interface CriterioDesempateVista {
  paso: number;
  titulo: string;
  valor: string;
  detalle: string;
}

export interface AntiguedadVista {
  cargo: string;
  fechaInicio: string;
  fechaCese: string;
  fechaReincorporacion: string;
  fechaFin: string;
  tiempo: string;
  criterios: CriterioDesempateVista[];
}

/** Factor II al V: tarjeta con su tabla de detalle. */
export interface FactorVista {
  numero: string;
  titulo: string;
  puntaje: PuntajeVista;
  esAntiguedad: boolean;
  /** Solo en II; `null` si la ficha no tiene antigüedad registrada. */
  antiguedad: AntiguedadVista | null;
  /** Filas con puntaje primero y luego las que no suman (que la vista pliega). */
  indicadores: IndicadorVista[];
  sinPuntaje: number;
}

/** Concepto registrado y su cantidad ("Artículo" → "1", "Horas por semana" → "10"). */
export interface ConceptoVista {
  etiqueta: string;
  valor: string;
}

/** Factor VI al IX: tarjeta pequeña con lo registrado como lista de conceptos. */
export interface FactorResumenVista {
  numero: string;
  titulo: string;
  puntaje: PuntajeVista;
  /** Avance de 0 a 100 respecto del tope; `null` sin tope (IX). */
  avance: number | null;
  conceptos: ConceptoVista[];
  /** Texto cuando no hay conceptos registrados. */
  sinRegistros: string;
  esDemeritos: boolean;
}

export interface FichaVista {
  nombre: string;
  cargo: string;
  distrito: string;
  dni: string;
  nacimiento: string;
  primeraEspecialidad: string;
  segundaEspecialidad: string | null;
  antiguedadGrado: string;
  calificadoAl: string;
  total: string;
  maximo: string;
  produccion: { titulo: string; nota: string } | null;
  factores: FactorVista[];
  otros: FactorResumenVista[];
  positivo: string;
  demeritos: PuntajeVista;
}

/** `{ anios, meses, dias }` → `11a 8m 22d`. */
export function formatearTiempoCorto(tiempo: TiempoAntiguedad | null): string {
  return tiempo ? `${tiempo.anios}a ${tiempo.meses}m ${tiempo.dias}d` : SIN_DATO;
}

/** `{ 4, 4, 6 }` → "4 años, 4 meses y 6 días"; omite las partes en cero ("2 años y 5 meses"). */
export function formatearTiempoLargo(tiempo: TiempoAntiguedad | null): string {
  if (!tiempo) {
    return SIN_DATO;
  }
  const plural = (n: number, singular: string, varios: string) => `${n} ${n === 1 ? singular : varios}`;
  const partes = [
    tiempo.anios ? plural(tiempo.anios, 'año', 'años') : '',
    tiempo.meses ? plural(tiempo.meses, 'mes', 'meses') : '',
    tiempo.dias ? plural(tiempo.dias, 'día', 'días') : '',
  ].filter(Boolean);
  if (!partes.length) {
    return '0 días';
  }
  return partes.length === 1
    ? partes[0]
    : `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
}

/** "15:30:00" → "15:30"; conserva los segundos solo si no son cero. */
export function formatearHora(hora: string | null): string {
  if (!hora) {
    return SIN_DATO;
  }
  return hora.replace(/^(\d{1,2}:\d{2}):00$/, '$1');
}

/** "PRODUCCIÓN JURISDICCIONAL" → "Producción jurisdiccional"; respeta siglas (AMAG, R.A., V.2). */
export function aOracion(texto: string | null | undefined): string {
  const limpio = (texto ?? '').trim();
  if (!limpio) {
    return '';
  }
  const frase = limpio
    .split(/\s+/)
    .map((palabra) =>
      /[\d.]/.test(palabra) || SIGLAS.has(palabra.replace(/[(),]/g, ''))
        ? palabra
        : palabra.toLocaleLowerCase('es')
    )
    .join(' ');
  return frase.charAt(0).toLocaleUpperCase('es') + frase.slice(1);
}

/** "PEREZ GOMEZ JUAN" → "Perez Gomez Juan". */
export function aNombrePropio(texto: string | null | undefined): string {
  return (texto ?? '')
    .trim()
    .toLocaleLowerCase('es')
    .replace(/(^|[\s-])(\p{L})/gu, (_, separador: string, letra: string) =>
      `${separador}${letra.toLocaleUpperCase('es')}`
    );
}

export function puntajeVista(puntaje: number, maximo: number | null): PuntajeVista {
  return {
    valor: formatearPuntaje(puntaje),
    maximo: maximo == null ? '' : String(Number(maximo.toFixed(3))),
    negativo: puntaje < 0,
  };
}

export function fichaVista(ficha: FichaValoracionMeritos): FichaVista {
  const produccion = ficha.rubros.find((rubro) => rubro.numero === RUBRO_PRODUCCION);
  const fecha = (iso: string | null) => (iso ? formatearFechaCuadro(iso) : SIN_DATO);

  return {
    nombre: aNombrePropio(ficha.apellidosNombres),
    cargo: aNombrePropio(ficha.cargo),
    distrito: ficha.distritoJudicial ? `D.J. ${aNombrePropio(ficha.distritoJudicial)}` : '',
    dni: ficha.dni || SIN_DATO,
    nacimiento: ficha.edad == null
      ? fecha(ficha.fechaNacimiento)
      : `${fecha(ficha.fechaNacimiento)} · ${ficha.edad} años`,
    primeraEspecialidad: aOracion(ficha.primeraEspecialidad) || SIN_DATO,
    segundaEspecialidad: aOracion(ficha.segundaEspecialidad) || null,
    antiguedadGrado: formatearTiempoCorto(ficha.antiguedadAcumulada),
    calificadoAl: fecha(ficha.fechaCalificacion),
    total: formatearPuntaje(ficha.puntajeTotal),
    maximo: formatearPuntaje(ficha.puntajeMaximo),
    produccion: produccion ? separarNota(produccion.titulo) : null,
    factores: ficha.rubros
      .filter((rubro) => RUBROS_DETALLADOS.includes(rubro.numero))
      .map((rubro) => factorVista(rubro, ficha)),
    otros: ficha.rubros
      .filter(
        (rubro) => rubro.numero !== RUBRO_PRODUCCION && !RUBROS_DETALLADOS.includes(rubro.numero)
      )
      .map(factorResumenVista),
    positivo: formatearPuntaje(ficha.puntajePositivo),
    demeritos: puntajeVista(ficha.puntajeDemeritos, null),
  };
}

/** "PRODUCCIÓN JURISDICCIONAL (Suspendido mediante …)" → título + nota. */
function separarNota(titulo: string): { titulo: string; nota: string } {
  const coincidencia = /^(.*?)\s*\((.*)\)\s*$/.exec(titulo);
  return coincidencia
    ? { titulo: aOracion(coincidencia[1]), nota: coincidencia[2] }
    : { titulo: aOracion(titulo), nota: '' };
}

function factorVista(rubro: RubroFichaMeritos, ficha: FichaValoracionMeritos): FactorVista {
  const esAntiguedad = rubro.numero === RUBRO_ANTIGUEDAD;
  // En V cada subrubro es una fila, con su propio tope.
  const filas = rubro.subrubros.length
    ? rubro.subrubros.map(filaSubrubro)
    : rubro.indicadores.map((indicador, indice) =>
        indicadorVista(indicador, `i-${rubro.numero}-${indice}`)
      );
  const sinPuntaje = filas.filter((fila) => fila.vacio);

  return {
    numero: rubro.numero,
    titulo: aOracion(rubro.titulo),
    puntaje: puntajeVista(rubro.puntaje, rubro.puntajeMaximo),
    esAntiguedad,
    antiguedad: esAntiguedad ? antiguedadVista(ficha.cargo, ficha.antiguedad) : null,
    indicadores: [...filas.filter((fila) => !fila.vacio), ...sinPuntaje],
    sinPuntaje: sinPuntaje.length,
  };
}

function indicadorVista(indicador: IndicadorFichaMeritos, clave: string): IndicadorVista {
  return {
    clave,
    descripcion: aOracion(indicador.descripcion),
    cuenta: indicador.cuenta,
    detalle: indicador.detalle ?? SIN_DATO,
    puntaje: puntajeVista(indicador.puntaje, null),
    vacio: indicador.puntaje === 0,
  };
}

function filaSubrubro(subrubro: RubroFichaMeritos): IndicadorVista {
  const detalles = subrubro.indicadores
    .map((indicador) => indicador.detalle)
    .filter((detalle): detalle is string => !!detalle);
  return {
    clave: `s-${subrubro.numero}`,
    descripcion: aOracion(subrubro.titulo),
    cuenta: subrubro.indicadores.some((indicador) => indicador.cuenta),
    detalle: detalles.join(' · ') || SIN_DATO,
    puntaje: puntajeVista(subrubro.puntaje, subrubro.puntajeMaximo),
    vacio: subrubro.puntaje === 0,
  };
}

function factorResumenVista(rubro: RubroFichaMeritos): FactorResumenVista {
  const esDemeritos = rubro.numero === RUBRO_DEMERITOS;
  const maximo = rubro.puntajeMaximo;

  return {
    numero: rubro.numero,
    titulo: aOracion(rubro.titulo),
    puntaje: puntajeVista(rubro.puntaje, maximo),
    avance:
      maximo && maximo > 0 ? Math.min(100, Math.max(0, (rubro.puntaje / maximo) * 100)) : null,
    conceptos: rubro.indicadores
      .filter((indicador) => indicador.cuenta)
      .flatMap((indicador) => conceptos(indicador)),
    sinRegistros: esDemeritos ? 'Sin medidas disciplinarias vigentes' : 'Sin registros',
    esDemeritos,
  };
}

/**
 * El backend redacta `detalle` como "Concepto: n, Otro concepto, con comas: m".
 * Se corta solo tras cada ": n" (los nombres pueden llevar comas). Sin detalle,
 * el concepto es la descripción del indicador con su cantidad.
 */
function conceptos(indicador: IndicadorFichaMeritos): ConceptoVista[] {
  if (!indicador.detalle) {
    return [{ etiqueta: aOracion(indicador.descripcion), valor: String(indicador.cantidad) }];
  }
  return indicador.detalle
    .split(/(?<=:\s*[\d.]+)\s*[,·/]\s*/)
    .map((parte) => parte.trim())
    .filter(Boolean)
    .map((parte) => {
      const coincidencia = /^(.*?):\s*([\d.]+)$/.exec(parte);
      return coincidencia
        ? { etiqueta: coincidencia[1], valor: coincidencia[2] }
        : { etiqueta: parte, valor: '' };
    });
}

function antiguedadVista(
  cargo: string | null,
  antiguedad: AntiguedadFichaMeritos | null
): AntiguedadVista | null {
  if (!antiguedad) {
    return null;
  }
  const fecha = (iso: string | null) => (iso ? formatearFechaCuadro(iso) : SIN_DATO);
  const periodos = antiguedad.periodosProvisional;

  return {
    cargo: aNombrePropio(cargo) || 'Cargo evaluado',
    fechaInicio: fecha(antiguedad.fechaJuramento),
    fechaCese: fecha(antiguedad.fechaCese),
    fechaReincorporacion: fecha(antiguedad.fechaReincorporacion),
    fechaFin: fecha(antiguedad.fechaValoracion),
    tiempo: formatearTiempoCorto(antiguedad.tiempo),
    criterios: [
      {
        paso: 1,
        titulo: 'Tiempo en el cargo anterior',
        valor: formatearTiempoLargo(antiguedad.tiempoCargoAnterior),
        detalle: antiguedad.cargoAnterior
          ? `Como ${aNombrePropio(antiguedad.cargoAnterior)}`
          : 'Sin periodo anterior registrado',
      },
      {
        paso: 2,
        titulo: 'Provisionalidad en el nivel actual',
        valor: periodos > 0 ? formatearTiempoLargo(antiguedad.tiempoProvisional) : SIN_DATO,
        detalle:
          periodos > 0
            ? `Suma de ${periodos} periodo${periodos === 1 ? '' : 's'}`
            : 'Sin provisionalidades',
      },
      {
        paso: 3,
        titulo: 'Antigüedad en la colegiatura',
        valor:
          antiguedad.aniosColegiatura == null
            ? SIN_DATO
            : `${antiguedad.aniosColegiatura} año${antiguedad.aniosColegiatura === 1 ? '' : 's'}`,
        detalle: antiguedad.fechaColegiatura
          ? `Colegiado desde el ${fecha(antiguedad.fechaColegiatura)}`
          : 'Sin colegiatura registrada',
      },
      {
        paso: 4,
        titulo: 'Hora de juramento',
        valor: antiguedad.horaJuramento ? `${formatearHora(antiguedad.horaJuramento)} h` : SIN_DATO,
        detalle: antiguedad.fechaJuramento
          ? `Juramentó el ${fecha(antiguedad.fechaJuramento)}`
          : 'Sin fecha de juramento',
      },
    ],
  };
}
