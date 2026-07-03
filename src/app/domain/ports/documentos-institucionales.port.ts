import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  DocumentoInstitucional,
  SubirDocumentoPeticion,
} from '../models/documento-institucional.model';

/**
 * Puerto de salida: gestión de resoluciones y lineamientos (RF003).
 * Implementación mock hoy; sustituir por adaptador HTTP cuando el backend esté listo.
 */
export interface DocumentosInstitucionalesPort {
  listar(): Observable<DocumentoInstitucional[]>;
  subir(peticion: SubirDocumentoPeticion, usuario: string): Observable<DocumentoInstitucional>;
  reemplazar(
    id: string,
    peticion: SubirDocumentoPeticion,
    usuario: string
  ): Observable<DocumentoInstitucional>;
  descargar(id: string): Observable<Blob>;
}

export const DOCUMENTOS_INSTITUCIONALES_PORT = new InjectionToken<DocumentosInstitucionalesPort>(
  'DOCUMENTOS_INSTITUCIONALES_PORT'
);
