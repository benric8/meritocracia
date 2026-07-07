import { Injectable } from '@angular/core';
import { delay, map, Observable, of, throwError } from 'rxjs';
import {
  DocumentoInstitucional,
  SubirDocumentoPeticion,
} from '../../../domain/models/documento-institucional.model';
import { PeticionPaginada, ResultadoPaginado } from '../../../domain/models/paginacion.model';
import { DocumentosInstitucionalesPort } from '../../../domain/ports/documentos-institucionales.port';

const STORAGE_KEY = 'MC_DOCS_INST_MOCK';
const LATENCIA_MS = 450;

interface DocumentoMockPersistido extends DocumentoInstitucional {
  contenidoBase64: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentosInstitucionalesMockAdapter implements DocumentosInstitucionalesPort {
  private leerAlmacen(): DocumentoMockPersistido[] {
    try {
      const crudo = localStorage.getItem(STORAGE_KEY);
      if (!crudo) {
        const iniciales = this.datosIniciales();
        this.guardarAlmacen(iniciales);
        return iniciales;
      }
      return JSON.parse(crudo) as DocumentoMockPersistido[];
    } catch {
      const iniciales = this.datosIniciales();
      this.guardarAlmacen(iniciales);
      return iniciales;
    }
  }

  private guardarAlmacen(documentos: DocumentoMockPersistido[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documentos));
  }

  private datosIniciales(): DocumentoMockPersistido[] {
    const ahora = new Date().toISOString();
    return [
      {
        id: 'doc-seed-1',
        tipo: 'RESOLUCION',
        nombreArchivo: 'ra-031-2013.pdf',
        fechaPublicacion: ahora,
        usuarioPublicacion: 'sistema',
        contenidoBase64: ''
      },
      {
        id: 'doc-seed-2',
        nombreArchivo: 'Lineamientos de valoración 2026',
        tipo: 'LINEAMIENTO',
        fechaPublicacion: ahora,
        usuarioPublicacion: 'sistema',
        contenidoBase64: ''
      },
    ];
  }

  /** PDF mínimo válido para simular descargas en mock. */
  private pdfMinimoBase64(): string {
    return btoa('%PDF-1.4 mock meritocracia');
  }

  private aPublico(doc: DocumentoMockPersistido): DocumentoInstitucional {
    const { contenidoBase64: _c, ...publico } = doc;
    return publico;
  }

  private archivoABase64(archivo: File): Observable<string> {
    return new Observable((subscriber) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resultado = reader.result as string;
        const base64 = resultado.includes(',') ? resultado.split(',')[1] : resultado;
        subscriber.next(base64);
        subscriber.complete();
      };
      reader.onerror = () => subscriber.error(new Error('No se pudo leer el archivo.'));
      reader.readAsDataURL(archivo);
    });
  }

  listar(peticion: PeticionPaginada): Observable<ResultadoPaginado<DocumentoInstitucional>> {
    const docs = this.leerAlmacen().map((d) => this.aPublico(d));
    const inicio = (peticion.pagina - 1) * peticion.tamanio;
    const elementos = docs.slice(inicio, inicio + peticion.tamanio);
    const totalRegistros = docs.length;
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / peticion.tamanio));

    return of({
      elementos,
      totalRegistros,
      totalPaginas,
      paginaActual: peticion.pagina,
      tamanioPagina: peticion.tamanio,
    }).pipe(delay(LATENCIA_MS));
  }

  subir(peticion: SubirDocumentoPeticion, usuario: string): Observable<DocumentoInstitucional> {
    return this.archivoABase64(peticion.archivo).pipe(
      map((contenidoBase64) => {
        const documentos = this.leerAlmacen();
        const nuevo: DocumentoMockPersistido = {
          id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          nombreArchivo: peticion.nombre.trim(),
          tipo: peticion.tipo,
          fechaPublicacion: new Date().toISOString(),
          usuarioPublicacion: usuario,
          contenidoBase64,
        };
        documentos.unshift(nuevo);
        this.guardarAlmacen(documentos);
        return this.aPublico(nuevo);
      }),
      delay(LATENCIA_MS)
    );
  }

  reemplazar(
    id: string,
    peticion: SubirDocumentoPeticion,
    usuario: string
  ): Observable<DocumentoInstitucional> {
    const documentos = this.leerAlmacen();
    const indice = documentos.findIndex((d) => d.id === id);
    if (indice < 0) {
      return throwError(() => new Error('Documento no encontrado.')).pipe(delay(LATENCIA_MS));
    }

    return this.archivoABase64(peticion.archivo).pipe(
      map((contenidoBase64) => {
        const actualizado: DocumentoMockPersistido = {
          ...documentos[indice],
          nombreArchivo: peticion.nombre.trim(),
          tipo: peticion.tipo,
          fechaPublicacion: new Date().toISOString(),
          usuarioPublicacion: usuario,
          contenidoBase64,
        };
        documentos[indice] = actualizado;
        this.guardarAlmacen(documentos);
        return this.aPublico(actualizado);
      }),
      delay(LATENCIA_MS)
    );
  }

  descargar(id: string): Observable<Blob> {
    const doc = this.leerAlmacen().find((d) => d.id === id);
    if (!doc) {
      return throwError(() => new Error('Documento no encontrado.')).pipe(delay(LATENCIA_MS));
    }
    const binario = atob(doc.contenidoBase64);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) {
      bytes[i] = binario.charCodeAt(i);
    }
    return of(new Blob([bytes], { type: 'application/pdf' })).pipe(delay(LATENCIA_MS));
  }
}
