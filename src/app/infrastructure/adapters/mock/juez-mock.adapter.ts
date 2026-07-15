import { Injectable } from '@angular/core';
import { delay, Observable, of, switchMap, throwError, timer } from 'rxjs';
import {
  CalculoEdadJuez,
  DatosSigaJuez,
  EdadJuez,
} from '../../../domain/models/datos-siga-juez.model';
import { JuezPort } from '../../../domain/ports/juez.port';

const LATENCIA_MS = 350;

/** DNI de prueba con foto placeholder SVG (data URL). */
const FOTO_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="140" viewBox="0 0 120 140">
      <rect width="120" height="140" fill="#e2e8f0"/>
      <circle cx="60" cy="52" r="28" fill="#94a3b8"/>
      <ellipse cx="60" cy="120" rx="40" ry="28" fill="#94a3b8"/>
    </svg>`
  );

const JUECES_SIGA: Record<string, DatosSigaJuez> = {
  '12345678': {
    nombreCompleto: 'García López, Pedro Juan',
    foto: FOTO_PLACEHOLDER,
  },
  '87654321': {
    nombreCompleto: 'Espinoza Avendaño, René Edgar',
    foto: FOTO_PLACEHOLDER,
  },
  '44556677': {
    nombreCompleto: 'Torres Mendoza, Ana Lucía',
    foto: FOTO_PLACEHOLDER,
  },
};

@Injectable({ providedIn: 'root' })
export class JuezMockAdapter implements JuezPort {
  obtenerDatosSiga(dni: string): Observable<DatosSigaJuez> {
    const documento = dni.trim();
    const datos = JUECES_SIGA[documento];

    if (!datos) {
      return this.errorConLatencia(
        `No se encontró juez con DNI ${documento} en SIGA (mock). Pruebe 12345678, 87654321 o 44556677.`
      );
    }

    return of({ ...datos }).pipe(delay(LATENCIA_MS));
  }

  calcularEdad(peticion: CalculoEdadJuez): Observable<EdadJuez> {
    const nacimiento = this.parsearFechaIso(peticion.fechaNacimiento);
    const valoracion = this.parsearFechaIso(peticion.fechaValoracion);

    if (!nacimiento || !valoracion) {
      return this.errorConLatencia('Fechas inválidas para calcular la edad.');
    }

    if (valoracion.getTime() < nacimiento.getTime()) {
      return this.errorConLatencia(
        'La fecha de valoración no puede ser anterior a la fecha de nacimiento.'
      );
    }

    let edad = valoracion.getFullYear() - nacimiento.getFullYear();
    const mes = valoracion.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && valoracion.getDate() < nacimiento.getDate())) {
      edad -= 1;
    }

    return of({ edad }).pipe(delay(LATENCIA_MS));
  }

  private errorConLatencia(mensaje: string): Observable<never> {
    return timer(LATENCIA_MS).pipe(switchMap(() => throwError(() => new Error(mensaje))));
  }

  private parsearFechaIso(iso: string): Date | null {
    const soloFecha = iso.trim().slice(0, 10);
    const partes = soloFecha.split('-');
    if (partes.length !== 3) {
      return null;
    }

    const anio = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    if (!Number.isFinite(anio) || !Number.isFinite(mes) || !Number.isFinite(dia)) {
      return null;
    }

    const fecha = new Date(anio, mes - 1, dia);
    if (
      fecha.getFullYear() !== anio ||
      fecha.getMonth() !== mes - 1 ||
      fecha.getDate() !== dia
    ) {
      return null;
    }

    return fecha;
  }
}
