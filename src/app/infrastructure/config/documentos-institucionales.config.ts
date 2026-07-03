import { environment } from '../../../environments/environment';
import { ConfigValidacionPdf } from '../../domain/commons/validacion-archivo-pdf';

export interface ConfigDocumentosInstitucionales extends ConfigValidacionPdf {
  latenciaMockMs?: number;
}

const CONFIG_DEFECTO: ConfigDocumentosInstitucionales = {
  maxTamanoBytes: 5 * 1024 * 1024,
  mimePermitido: 'application/pdf',
  latenciaMockMs: 450,
};

type EnvironmentConDocumentos = typeof environment & {
  documentosInstitucionales?: Partial<ConfigDocumentosInstitucionales>;
};

/** Configuración centralizada; sobreescribir en environment.*. */
export function obtenerConfigDocumentosInstitucionales(): ConfigDocumentosInstitucionales {
  const env = environment as EnvironmentConDocumentos;
  return {
    ...CONFIG_DEFECTO,
    ...env.documentosInstitucionales,
  };
}
