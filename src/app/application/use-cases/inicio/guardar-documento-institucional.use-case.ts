import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { validarArchivoPdf } from '../../../domain/commons/validacion-archivo-pdf';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import {
  DocumentoInstitucional,
  SubirDocumentoPeticion,
} from '../../../domain/models/documento-institucional.model';
import { DOCUMENTOS_INSTITUCIONALES_PORT } from '../../../domain/ports/documentos-institucionales.port';
import { obtenerConfigDocumentosInstitucionales } from '../../../infrastructure/config/documentos-institucionales.config';

export type GuardarDocumentoInstitucionalResultado =
  | { exito: true; documento: DocumentoInstitucional }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class GuardarDocumentoInstitucionalUseCase {
  private readonly documentos = inject(DOCUMENTOS_INSTITUCIONALES_PORT);

  ejecutar(
    peticion: SubirDocumentoPeticion,
    usuario: string,
    documentoId?: string
  ): Observable<GuardarDocumentoInstitucionalResultado> {
    const nombre = peticion.nombre?.trim();
    if (!nombre) {
      return of({ exito: false, mensaje: 'El nombre del documento es obligatorio.' });
    }

    const config = obtenerConfigDocumentosInstitucionales();
    const validacion = validarArchivoPdf(peticion.archivo, config);
    if (!validacion.valido) {
      return of({ exito: false, mensaje: validacion.mensaje });
    }

    const peticionNormalizada: SubirDocumentoPeticion = {
      ...peticion,
      nombre,
    };

    const operacion = documentoId
      ? this.documentos.reemplazar(documentoId, peticionNormalizada, usuario)
      : this.documentos.subir(peticionNormalizada, usuario);

    return operacion.pipe(
      map((documento) => ({ exito: true as const, documento })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo guardar el documento.'),
        })
      )
    );
  }
}
