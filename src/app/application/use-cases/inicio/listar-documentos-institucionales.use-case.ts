import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DocumentoInstitucional } from '../../../domain/models/documento-institucional.model';
import { DOCUMENTOS_INSTITUCIONALES_PORT } from '../../../domain/ports/documentos-institucionales.port';

@Injectable({ providedIn: 'root' })
export class ListarDocumentosInstitucionalesUseCase {
  private readonly documentos = inject(DOCUMENTOS_INSTITUCIONALES_PORT);

  ejecutar(): Observable<DocumentoInstitucional[]> {
    return this.documentos.listar();
  }
}
