import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MotivoSuplencia } from '../../../domain/models/suplencia.model';
import { SUPLENCIAS_PORT } from '../../../domain/ports/suplencias.port';

@Injectable({ providedIn: 'root' })
export class ListarMotivosSuplenciaUseCase {
  private readonly suplencias = inject(SUPLENCIAS_PORT);

  ejecutar(): Observable<MotivoSuplencia[]> {
    return this.suplencias.listarMotivos();
  }
}
