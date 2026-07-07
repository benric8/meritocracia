import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  DocumentoInstitucional,
  SubirDocumentoPeticion,
} from '../models/documento-institucional.model';
import { PeticionPaginada, ResultadoPaginado } from '../models/paginacion.model';

/**
 * Puerto de salida: gestión de resoluciones y lineamientos (RF003).
 */
export interface DocumentosInstitucionalesPort {
  listar(peticion: PeticionPaginada): Observable<ResultadoPaginado<DocumentoInstitucional>>;
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
