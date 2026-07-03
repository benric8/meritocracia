import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DOCUMENTOS_INSTITUCIONALES_PORT } from '../../../domain/ports/documentos-institucionales.port';

@Injectable({ providedIn: 'root' })
export class DescargarDocumentoInstitucionalUseCase {
  private readonly documentos = inject(DOCUMENTOS_INSTITUCIONALES_PORT);

  ejecutar(id: string): Observable<Blob> {
    return this.documentos.descargar(id);
  }
}
