import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CalculoEdadJuez,
  DatosSigaJuez,
  EdadJuez,
} from '../../../domain/models/datos-siga-juez.model';
import { JuezPort } from '../../../domain/ports/juez.port';
import { JuezHttpAdapter } from '../http/juez-http.adapter';
import { JuezMockAdapter } from './juez-mock.adapter';

/**
 * SIGA ya disponible en API; edad aún mock hasta el endpoint de cálculo.
 * Sustituir por `JuezHttpAdapter` cuando ambos endpoints estén listos.
 */
@Injectable({ providedIn: 'root' })
export class JuezSigaHttpEdadMockAdapter implements JuezPort {
  private readonly http = inject(JuezHttpAdapter);
  private readonly mock = inject(JuezMockAdapter);

  obtenerDatosSiga(dni: string): Observable<DatosSigaJuez> {
    return this.http.obtenerDatosSiga(dni);
  }

  calcularEdad(peticion: CalculoEdadJuez): Observable<EdadJuez> {
    return this.mock.calcularEdad(peticion);
  }
}
