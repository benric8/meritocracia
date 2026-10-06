import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import {
  CrearBorradorFicha,
  FichaValoracion,
} from '../../../domain/models/ficha-valoracion.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type CrearBorradorFichaResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class CrearBorradorFichaUseCase {
  private readonly fichas = inject(FICHA_PORT);

  ejecutar(peticion: CrearBorradorFicha): Observable<CrearBorradorFichaResultado> {
    const dni = peticion.datosPersonales?.dni?.trim() ?? '';
    const nombre = peticion.datosPersonales?.nombreCompleto?.trim() ?? '';
    const nivelId = peticion.nivelId?.trim() ?? '';
    const fechaNacimiento = peticion.datosPersonales?.fechaNacimiento?.trim() ?? '';
    const sexo = peticion.datosPersonales?.sexo;

    if (!/^\d{8}$/.test(dni)) {
      return of({ exito: false, mensaje: 'Ingrese el DNI del juez (8 dígitos).' });
    }
    if (!nombre) {
      return of({
        exito: false,
        mensaje: 'Consulte el DNI en SIGA para obtener los apellidos y nombres.',
      });
    }
    if (!nivelId) {
      return of({ exito: false, mensaje: 'Seleccione el nivel.' });
    }
    if (!fechaNacimiento) {
      return of({ exito: false, mensaje: 'Seleccione la fecha de nacimiento.' });
    }
    if (sexo !== 'M' && sexo !== 'F') {
      return of({ exito: false, mensaje: 'Seleccione el sexo.' });
    }
    if (!peticion.fechaValoracionId?.trim() || !peticion.fechaValoracionSnapshot?.trim()) {
      return of({
        exito: false,
        mensaje: 'No hay fecha de valoración vigente. Configure una antes de crear la ficha.',
      });
    }

    return this.fichas.crearBorrador(peticion).pipe(
      map((ficha) => ({ exito: true as const, ficha })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo crear el borrador de la ficha.'),
        })
      )
    );
  }
}
