/**
 * Agregado raíz de la ficha de valoración (RF006).
 * Una ficha = un juez (DNI) + una fecha de valoración (periodo).
 */

import { RubroAntiguedad } from './rubro-antiguedad.model';
import { crearRubroAmagVacio, RubroAmag } from './rubro-amag.model';
import {
  crearRubroGradosTitulosVacio,
  RubroGradosTitulos,
} from './rubro-grados-titulos.model';
import { TIEMPO_SERVICIO_CERO } from './tiempo-servicio.model';

export { crearRubroAmagVacio, crearRubroGradosTitulosVacio };

export type EstadoFicha = 'BORRADOR' | 'REGISTRADA' | 'CERRADA';

export interface DatosPersonalesJuez {
  dni: string;
  nombreCompleto: string;
  /** Referencia o data URL de la foto SIGA. */
  foto: string;
  fechaNacimiento: string;
  sexo: 'M' | 'F';
  /** Edad calculada vs fechaValoracionSnapshot; la persiste el back. */
  edad: number | null;
}

export interface FichaValoracion {
  id: string;
  estado: EstadoFicha;
  nivelId: string;
  nivelNombre: string;
  fechaValoracionId: string;
  /** Snapshot congelado al crear; base de todos los cálculos. */
  fechaValoracionSnapshot: string;
  datosPersonales: DatosPersonalesJuez;
  /** Trazabilidad del arrastre desde un ciclo anterior. */
  fichaPreviaId: string | null;
  rubroAntiguedad: RubroAntiguedad | null;
  rubroGradosTitulos: RubroGradosTitulos | null;
  rubroAmag: RubroAmag | null;
  puntajeTotal: number;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearBorradorFicha {
  nivelId: string;
  nivelNombre: string;
  fechaValoracionId: string;
  fechaValoracionSnapshot: string;
  datosPersonales: DatosPersonalesJuez;
  /** Si hay ficha en ciclo pasado, el back arrastra ítems vigentes. */
  arrastrarDesdeFichaId?: string | null;
}

export interface ActualizarDatosPersonalesFicha {
  nivelId: string;
  nivelNombre: string;
  datosPersonales: DatosPersonalesJuez;
}

/**
 * Resultado de resolver si el juez ya tiene ficha en el ciclo vigente.
 * Clave natural: (dni, fechaValoracionId, registradorId).
 * Mapea la respuesta de GET /fichas/flujo.
 */
export type ResultadoResolverFicha =
  | { tipo: 'NUEVA' }
  | { tipo: 'NUEVA_CON_PREVIA'; fichaPreviaId: string; magistradoId?: string }
  | { tipo: 'EDITABLE'; fichaId: string; magistradoId?: string }
  | { tipo: 'BLOQUEADA'; fichaId: string; magistradoId?: string }
  | { tipo: 'ASIGNADO_A_OTRO'; fichaId: string; magistradoId?: string };

export function crearRubroAntiguedadVacio(): RubroAntiguedad {
  return {
    id: null,
    titularidad: {
      distritoJudicialId: '',
      cargoTitularId: '',
      fechaJuramentacion: null,
      horaJuramento: null,
      fechaCese: null,
      fechaReincorporacion: null,
      fechaValoracion: null,
      tiempoTotal: TIEMPO_SERVICIO_CERO,
      puntaje: 0,
      primeraEspecialidadId: '',
      segundaEspecialidadId: '',
    },
    periodoNivelAnterior: {
      id: null,
      nivelInmediatoAnteriorId: '',
      fechaInicio: null,
      fechaFin: null,
      tiempoTotal: TIEMPO_SERVICIO_CERO,
    },
    provisionalidades: [],
    sumaProvisionalidades: TIEMPO_SERVICIO_CERO,
    colegiaturas: [],
  };
}
