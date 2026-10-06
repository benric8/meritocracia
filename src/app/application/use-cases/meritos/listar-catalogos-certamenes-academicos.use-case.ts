import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { CatalogoCertamen } from '../../../domain/models/rubro-certamenes-academicos.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export interface CatalogosCertamenesAcademicos {
  eventos: CatalogoCertamen[];
  modalidades: CatalogoCertamen[];
  tiposParticipacion: CatalogoCertamen[];
  paises: CatalogoItem[];
  especialidades: CatalogoItem[];
}

export type ListarCatalogosCertamenesAcademicosResultado =
  | { exito: true; catalogos: CatalogosCertamenesAcademicos }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ListarCatalogosCertamenesAcademicosUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(): Observable<ListarCatalogosCertamenesAcademicosResultado> {
    return forkJoin({
      eventos: this.maestros.listarEventos(),
      modalidades: this.maestros.listarModalidades(),
      tiposParticipacion: this.maestros.listarTiposParticipacionCertamen(),
      paises: this.maestros.listarPaises(),
      especialidades: this.maestros.listarEspecialidades(),
    }).pipe(
      map((catalogos) => ({ exito: true as const, catalogos })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron cargar los catálogos de certámenes académicos.'),
        })
      )
    );
  }
}
