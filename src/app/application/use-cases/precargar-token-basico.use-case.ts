import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AUTENTICACION_PORT } from '../../domain/ports/autenticacion.port';

/** Precarga el token básico (handshake) al entrar a la pantalla de login. */
@Injectable({ providedIn: 'root' })
export class PrecargarTokenBasicoUseCase {
  private readonly autenticacion = inject(AUTENTICACION_PORT);

  ejecutar(): Observable<unknown> {
    return this.autenticacion.asegurarTokenBasico();
  }
}
