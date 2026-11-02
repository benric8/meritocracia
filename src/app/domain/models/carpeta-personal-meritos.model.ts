/** Tabla de un rubro tal como la arma el backend: textos ya formateados. */
export interface TablaCarpetaMeritos {
  titulo: string | null;
  columnas: string[];
  /** Peso relativo de cada columna (mismo largo que `columnas`). */
  anchos: number[];
  filas: string[][];
}

export interface SeccionCarpetaMeritos {
  numero: string;
  titulo: string;
  nota: string | null;
  tablas: TablaCarpetaMeritos[];
}

/** Carpeta Personal de Méritos (RF007 — Submenú F, Anexo 05). */
export interface CarpetaPersonalMeritos {
  idFicha: string;
  fechaValoracion: string;
  /** JPG en Base64; `null` si no se pudo obtener la foto. */
  fotoBase64: string | null;
  dni: string;
  apellidosNombres: string;
  sexo: string | null;
  estadoCivil: string | null;
  fechaNacimiento: string | null;
  edad: number | null;
  distritoJudicial: string | null;
  despachoJudicial: string | null;
  cargo: string | null;
  condicion: string | null;
  primeraEspecialidad: string | null;
  segundaEspecialidad: string | null;
  anexoTelefonico: string | null;
  correoInstitucional: string | null;
  secciones: SeccionCarpetaMeritos[];
}
