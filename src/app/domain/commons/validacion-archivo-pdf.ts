export interface ConfigValidacionPdf {
  maxTamanoBytes: number;
  mimePermitido?: string;
}

export interface ResultadoValidacionArchivo {
  valido: boolean;
  mensaje?: string;
}

const MIME_PDF = 'application/pdf';

/** Valida extensión, MIME y tamaño máximo configurable. */
export function validarArchivoPdf(
  archivo: File,
  config: ConfigValidacionPdf
): ResultadoValidacionArchivo {
  if (!archivo) {
    return { valido: false, mensaje: 'Debe seleccionar un archivo PDF.' };
  }

  const nombre = archivo.name.toLowerCase();
  if (!nombre.endsWith('.pdf')) {
    return { valido: false, mensaje: 'Solo se permiten archivos con extensión .pdf.' };
  }

  const mimeEsperado = config.mimePermitido ?? MIME_PDF;
  if (archivo.type && archivo.type !== mimeEsperado) {
    return { valido: false, mensaje: 'El archivo debe ser de tipo PDF (application/pdf).' };
  }

  if (archivo.size <= 0) {
    return { valido: false, mensaje: 'El archivo está vacío.' };
  }

  if (archivo.size > config.maxTamanoBytes) {
    return {
      valido: false,
      mensaje: `El archivo supera el tamaño máximo permitido (${formatearTamanoBytes(config.maxTamanoBytes)}).`,
    };
  }

  return { valido: true };
}

export function formatearTamanoBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
