export interface DatosSigaJuez {
  nombreCompleto: string;
  /** URL o data URL (base64) de la foto; vacío si no hay imagen. */
  foto: string;
}

export interface CalculoEdadJuez {
  fechaNacimiento: string;
  fechaValoracion: string;
}

export interface EdadJuez {
  edad: number;
}
