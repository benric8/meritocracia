import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import {
  FechaValoracion,
  NuevaFechaValoracion,
} from '../../../domain/models/fecha-valoracion.model';
import { FechaValoracionPort } from '../../../domain/ports/fecha-valoracion.port';

const STORAGE_KEY = 'MC_FECHA_VALORACION_MOCK';
const LATENCIA_MS = 350;

@Injectable({ providedIn: 'root' })
export class FechaValoracionMockAdapter implements FechaValoracionPort {
  obtenerVigente(): Observable<FechaValoracion | null> {
    const vigente = this.leerAlmacen().find((item) => item.estado === 'VIGENTE') ?? null;
    return of(vigente).pipe(delay(LATENCIA_MS));
  }

  listarHistorial(): Observable<FechaValoracion[]> {
    const historial = [...this.leerAlmacen()].sort((a, b) =>
      b.fechaRegistro.localeCompare(a.fechaRegistro)
    );
    return of(historial).pipe(delay(LATENCIA_MS));
  }

  registrar(peticion: NuevaFechaValoracion, usuario: string): Observable<FechaValoracion> {
    const fechaValoracion = peticion.fechaValoracion.trim();
    const resolucion = peticion.resolucion.trim();

    if (!fechaValoracion || !resolucion) {
      return throwError(() => new Error('Datos incompletos para registrar la fecha de valoración.'));
    }

    const ahora = new Date().toISOString();
    const almacen = this.leerAlmacen().map((item) =>
      item.estado === 'VIGENTE' ? { ...item, estado: 'INACTIVO' as const } : item
    );

    const nueva: FechaValoracion = {
      id: `fv-${Date.now()}`,
      fechaValoracion,
      anio: Number(fechaValoracion.slice(0, 4)),
      resolucion,
      estado: 'VIGENTE',
      usuarioRegistro: usuario.trim(),
      fechaRegistro: ahora,
    };

    this.guardarAlmacen([nueva, ...almacen]);
    return of(nueva).pipe(delay(LATENCIA_MS));
  }

  desactivar(id: string): Observable<void> {
    const idNormalizado = id.trim();
    if (!idNormalizado) {
      return throwError(() => new Error('Identificador de fecha de valoración no válido.'));
    }

    const almacen = this.leerAlmacen();
    const indice = almacen.findIndex((item) => item.id === idNormalizado);

    if (indice < 0) {
      return throwError(() => new Error('No se encontró la fecha de valoración a desactivar.'));
    }

    if (almacen[indice].estado !== 'VIGENTE') {
      return throwError(() => new Error('Solo se puede desactivar una fecha de valoración vigente.'));
    }

    almacen[indice] = { ...almacen[indice], estado: 'INACTIVO' };
    this.guardarAlmacen(almacen);
    return of(undefined).pipe(delay(LATENCIA_MS));
  }

  private leerAlmacen(): FechaValoracion[] {
    try {
      const crudo = localStorage.getItem(STORAGE_KEY);
      if (!crudo) {
        const iniciales = this.datosIniciales();
        this.guardarAlmacen(iniciales);
        return iniciales;
      }
      return JSON.parse(crudo) as FechaValoracion[];
    } catch {
      const iniciales = this.datosIniciales();
      this.guardarAlmacen(iniciales);
      return iniciales;
    }
  }

  private guardarAlmacen(items: FechaValoracion[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  private datosIniciales(): FechaValoracion[] {
    return [
      {
        id: 'fv-seed-1',
        fechaValoracion: '2026-07-02',
        anio: 2026,
        resolucion:
          'Resolución Administrativa N° 045-2026-CEJ que aprueba la fecha de valoración del I semestre 2026',
        estado: 'VIGENTE',
        usuarioRegistro: 'Juan Pérez',
        fechaRegistro: '2026-07-01T15:30:00.000Z',
      },
      {
        id: 'fv-seed-2',
        fechaValoracion: '2026-05-15',
        anio: 2026,
        resolucion: 'Res. Admin. N° 112-2026-CEJ — Modifica fecha de valoración',
        estado: 'INACTIVO',
        usuarioRegistro: 'María López',
        fechaRegistro: '2026-05-15T10:00:00.000Z',
      },
      {
        id: 'fv-seed-3',
        fechaValoracion: '2025-12-31',
        anio: 2025,
        resolucion: 'Res. Admin. N° 318-2025-CEJ — Aprueba fecha cierre anual 2025',
        estado: 'INACTIVO',
        usuarioRegistro: 'Carlos Díaz',
        fechaRegistro: '2025-12-31T09:00:00.000Z',
      },
      {
        id: 'fv-seed-4',
        fechaValoracion: '2024-12-31',
        anio: 2024,
        resolucion: 'Res. Admin. N° 294-2024-CEJ — Aprueba fecha cierre anual 2024',
        estado: 'INACTIVO',
        usuarioRegistro: 'Ana Torres',
        fechaRegistro: '2024-12-31T09:00:00.000Z',
      },
    ];
  }
}
