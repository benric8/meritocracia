import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FechaValoracion } from '../../../domain/models/fecha-valoracion.model';
import { FECHA_VALORACION_PORT } from '../../../domain/ports/fecha-valoracion.port';

@Injectable({ providedIn: 'root' })
export class ListarHistorialFechasValoracionUseCase {
  private readonly fechas = inject(FECHA_VALORACION_PORT);

  ejecutar(): Observable<FechaValoracion[]> {
    return this.fechas.listarHistorial();
  }
}
