import { ConfigValidacionPdf } from '../../domain/commons/validacion-archivo-pdf';
import { environment } from '../../../environments/environment';

/** Límites de PDF definidos por ambiente en `src/environments`. */
export function obtenerConfigDocumentosInstitucionales(): ConfigValidacionPdf {
  return { ...environment.documentosInstitucionales };
}
