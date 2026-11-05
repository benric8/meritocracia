import { fotoSrc } from '../../../../domain/commons/foto-src';
import {
  CarpetaPersonalMeritos,
  SeccionCarpetaMeritos,
  TablaCarpetaMeritos,
} from '../../../../domain/models/carpeta-personal-meritos.model';
import { aNombrePropio, aOracion } from '../ficha-valoracion-meritos/ficha-valoracion-meritos.util';

/** Ruta de la pantalla (también se abre desde la Ficha de Valoración con `?ficha=`). */
export const RUTA_CARPETA_PERSONAL = '/reportes/carpeta-personal-meritos';

/** Columnas con este peso o menos van centradas (fechas, años, AA/MM/DD), como el PDF. */
const PESO_MAXIMO_CENTRADO = 12;
const SIN_DATO = '—';

export interface DatoVista {
  etiqueta: string;
  valor: string;
}

export interface ColumnaVista {
  titulo: string;
  /** Ancho en % del total de la tabla. */
  ancho: number;
  centrada: boolean;
}

export interface TablaVista {
  /** Código del subrubro ("V.2") separado de su título, si lo trae. */
  codigo: string | null;
  titulo: string | null;
  columnas: ColumnaVista[];
  filas: string[][];
}

export interface SeccionVista {
  id: string;
  numero: string;
  titulo: string;
  nota: string | null;
  tablas: TablaVista[];
  /** Filas de todas sus tablas: cuántos documentos registra el rubro. */
  registros: number;
}

export interface CarpetaVista {
  nombre: string;
  /** `src` listo para `<img>`, o `null` para el recuadro "Foto del juez". */
  foto: string | null;
  valoradoAl: string;
  personales: DatoVista[];
  laborales: DatoVista[];
  secciones: SeccionVista[];
}

export function carpetaVista(carpeta: CarpetaPersonalMeritos): CarpetaVista {
  return {
    nombre: aNombrePropio(carpeta.apellidosNombres) || SIN_DATO,
    foto: fotoSrc(carpeta.fotoBase64) || null,
    valoradoAl: formatearFecha(carpeta.fechaValoracion),
    personales: [
      { etiqueta: 'DNI', valor: dato(carpeta.dni) },
      { etiqueta: 'Sexo', valor: dato(carpeta.sexo) },
      { etiqueta: 'Estado civil', valor: dato(carpeta.estadoCivil) },
      { etiqueta: 'Fecha de nacimiento', valor: formatearFecha(carpeta.fechaNacimiento) },
      { etiqueta: 'Edad', valor: carpeta.edad == null ? SIN_DATO : `${carpeta.edad} años` },
      { etiqueta: 'Fecha de valoración', valor: formatearFecha(carpeta.fechaValoracion) },
    ],
    laborales: [
      { etiqueta: 'Distrito judicial', valor: dato(carpeta.distritoJudicial) },
      { etiqueta: 'Despacho judicial', valor: dato(carpeta.despachoJudicial) },
      { etiqueta: 'Cargo', valor: dato(carpeta.cargo) },
      { etiqueta: 'Condición', valor: dato(carpeta.condicion) },
      { etiqueta: 'Primera especialidad', valor: dato(carpeta.primeraEspecialidad) },
      { etiqueta: 'Segunda especialidad', valor: dato(carpeta.segundaEspecialidad) },
      { etiqueta: 'Anexo telefónico', valor: dato(carpeta.anexoTelefonico) },
      { etiqueta: 'Correo institucional', valor: carpeta.correoInstitucional ?? SIN_DATO },
    ],
    secciones: carpeta.secciones.map(seccionVista),
  };
}

function seccionVista(seccion: SeccionCarpetaMeritos): SeccionVista {
  const tablas = seccion.tablas.map(tablaVista);
  return {
    id: `rubro-${seccion.numero}`,
    numero: seccion.numero,
    titulo: aOracion(seccion.titulo),
    nota: seccion.nota,
    tablas,
    registros: tablas.reduce((suma, tabla) => suma + tabla.filas.length, 0),
  };
}

export function tablaVista(tabla: TablaCarpetaMeritos): TablaVista {
  const total = tabla.anchos.reduce((suma, peso) => suma + peso, 0);
  const [, codigo = null, titulo = tabla.titulo] =
    tabla.titulo?.match(/^([IVX]+\.\d+)\s+(.+)$/) ?? [];
  return {
    codigo,
    titulo: titulo ? aOracion(titulo) : null,
    columnas: tabla.columnas.map((columna, i) => {
      const peso = tabla.anchos[i] ?? 0;
      return {
        titulo: columna,
        ancho: total ? (peso * 100) / total : 100 / tabla.columnas.length,
        centrada: peso <= PESO_MAXIMO_CENTRADO,
      };
    }),
    // Los textos llegan ya formateados por el backend: se muestran tal cual.
    filas: tabla.filas,
  };
}

function dato(valor: string | null): string {
  return valor ? aNombrePropio(valor) : SIN_DATO;
}

/** `yyyy-MM-dd` → `dd/MM/yyyy` sin pasar por `Date` (evita el desfase UTC). */
function formatearFecha(iso: string | null): string {
  const [anio, mes, dia] = (iso ?? '').slice(0, 10).split('-');
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : SIN_DATO;
}
