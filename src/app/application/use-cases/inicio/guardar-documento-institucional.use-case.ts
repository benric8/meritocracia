import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { validarArchivoPdf } from '../../../domain/commons/validacion-archivo-pdf';
import {
  DocumentoInstitucional,
  SubirDocumentoPeticion,
} from '../../../domain/models/documento-institucional.model';
import { DOCUMENTOS_INSTITUCIONALES_PORT } from '../../../domain/ports/documentos-institucionales.port';
import { mensajeErrorHttp } from '../../../infrastructure/api/http-error.util';
import { obtenerConfigDocumentosInstitucionales } from '../../../infrastructure/config/documentos-institucionales.config';

export interface GuardarDocumentoInstitucionalResultado {
  exito: boolean;
  documento?: DocumentoInstitucional;
  mensaje?: string;
}

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
      catchError((error: unknown) =>
        of({
          exito: false as const,
          mensaje: mensajeErrorHttp(error, 'No se pudo guardar el documento.'),
        })
      )
    );
  }
}
