import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { ErrorNegocioApi } from '../../../domain/errors/error-negocio-api';
import {
  crearRubroAmagVacio,
  EstudioAmag,
  RubroAmag,
} from '../../../domain/models/rubro-amag.model';
import { esIdPersistidoApi } from '../../mappers/ficha-antiguedad.mapper';

const STORAGE_KEY = 'MC_FICHA_AMAG_MOCK';
const STORAGE_SEQ_KEY = 'MC_FICHA_AMAG_MOCK_SEQ';
const LATENCIA_MS = 400;

/** Puntajes simulados según tabla de valoración (RV001). */
const PUNTAJE_POR_TIPO: Record<string, number> = {
  '1': 8,
  '2': 6,
  '3': 4,
  habilitante: 8,
  profa: 6,
  ascenso: 4,
};

/**
 * Mock del rubro D hasta disponer del API `ficha-amag`.
 * Persiste ítems por `fichaId` en localStorage.
 */
@Injectable({ providedIn: 'root' })
export class FichaAmagMockAdapter {
  obtenerRubroAmag(fichaId: string): Observable<RubroAmag> {
    const id = fichaId?.trim() ?? '';
    if (!id) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Identificador de ficha no válido.',
          })
      );
    }

    return of(this.leerRubro(id)).pipe(delay(LATENCIA_MS));
  }

  upsertEstudioAmag(fichaId: string, item: EstudioAmag): Observable<RubroAmag> {
    const id = fichaId?.trim() ?? '';
    if (!id) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Identificador de ficha no válido.',
          })
      );
    }

    const almacen = this.leerAlmacen();
    const items = [...(almacen[id] ?? [])];
    const esActualizacion = esIdPersistidoApi(item.id);
    const puntaje = this.calcularPuntaje(item);

    const guardado: EstudioAmag = {
      ...item,
      id: esActualizacion ? item.id : String(this.siguienteId()),
      puntaje,
    };

    const indice = items.findIndex((actual) => actual.id === guardado.id);
    if (indice >= 0) {
      items[indice] = guardado;
    } else {
      items.push(guardado);
    }

    almacen[id] = items;
    this.guardarAlmacen(almacen);

    return of(this.aRubro(items)).pipe(delay(LATENCIA_MS));
  }

  eliminarEstudioAmag(fichaId: string, itemId: string): Observable<RubroAmag> {
    const id = fichaId?.trim() ?? '';
    const idItem = itemId?.trim() ?? '';
    if (!id || !esIdPersistidoApi(idItem)) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Identificador de estudio AMAG no válido.',
          })
      );
    }

    const almacen = this.leerAlmacen();
    const items = (almacen[id] ?? []).filter((item) => item.id !== idItem);
    almacen[id] = items;
    this.guardarAlmacen(almacen);

    return of(this.aRubro(items)).pipe(delay(LATENCIA_MS));
  }

  private calcularPuntaje(item: EstudioAmag): number {
    const porId = PUNTAJE_POR_TIPO[item.tipoCursoId.trim()];
    if (porId != null) {
      return porId;
    }

    const nombre = item.tipoCursoNombre.trim().toLowerCase();
    return PUNTAJE_POR_TIPO[nombre] ?? 4;
  }

  private aRubro(items: EstudioAmag[]): RubroAmag {
    const puntajeTotal = items.reduce((sum, item) => sum + (Number(item.puntaje) || 0), 0);
    return {
      items: structuredClone(items),
      puntajeTotal,
    };
  }

  private leerRubro(fichaId: string): RubroAmag {
    const items = this.leerAlmacen()[fichaId] ?? [];
    if (!items.length) {
      return crearRubroAmagVacio();
    }
    return this.aRubro(items);
  }

  private leerAlmacen(): Record<string, EstudioAmag[]> {
    try {
      const crudo = localStorage.getItem(STORAGE_KEY);
      if (!crudo) {
        return {};
      }
      return JSON.parse(crudo) as Record<string, EstudioAmag[]>;
    } catch {
      return {};
    }
  }

  private guardarAlmacen(almacen: Record<string, EstudioAmag[]>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(almacen));
  }

  private siguienteId(): number {
    const actual = Number(localStorage.getItem(STORAGE_SEQ_KEY) ?? '2000');
    const siguiente = Number.isFinite(actual) && actual >= 2000 ? actual + 1 : 2001;
    localStorage.setItem(STORAGE_SEQ_KEY, String(siguiente));
    return siguiente;
  }
}
