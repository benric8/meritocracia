import { ConfigValidacionPdf } from '../../domain/commons/validacion-archivo-pdf';
import { getAppConfig } from './app-runtime-config';

export interface ConfigDocumentosInstitucionales extends ConfigValidacionPdf {
  latenciaMockMs?: number;
}

/** Configuración de documentos desde `assets/config.json`. */
export function obtenerConfigDocumentosInstitucionales(): ConfigDocumentosInstitucionales {
  return { ...getAppConfig().documentosInstitucionales };
}
