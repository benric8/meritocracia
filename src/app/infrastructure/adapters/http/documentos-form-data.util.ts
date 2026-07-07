import { SubirDocumentoPeticion } from '../../../domain/models/documento-institucional.model';

/**
 * Construye el multipart esperado por POST documentos:
 * - data: nombre del documento (texto)
 * - archivo: PDF
 */
export function crearFormDataDocumento(peticion: SubirDocumentoPeticion): FormData {
  const formData = new FormData();
  formData.append('nombre', peticion.nombre.trim());
  formData.append('tipo', peticion.tipo.trim());
  formData.append('archivo', peticion.archivo, peticion.archivo.name);
  return formData;
}
