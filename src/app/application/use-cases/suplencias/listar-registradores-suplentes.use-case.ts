import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RegistradorSuplente } from '../../../domain/models/suplencia.model';
import { SUPLENCIAS_PORT } from '../../../domain/ports/suplencias.port';

/** Lista completa (sin excluir titular); la exclusión por fila se hace en el front. */
@Injectable({ providedIn: 'root' })
export class ListarRegistradoresSuplentesUseCase {
  private readonly suplencias = inject(SUPLENCIAS_PORT);

  ejecutar(): Observable<RegistradorSuplente[]> {
    return this.suplencias.listarRegistradores();
  }
}
