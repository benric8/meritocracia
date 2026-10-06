import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { ErrorNegocioApi } from '../../../domain/errors/error-negocio-api';
import {
  crearRubroGradosTitulosVacio,
  GradoTitulo,
  RubroGradosTitulos,
} from '../../../domain/models/rubro-grados-titulos.model';
import { esIdPersistidoApi } from '../../mappers/ficha-antiguedad.mapper';

const STORAGE_KEY = 'MC_FICHA_GRADOS_TITULOS_MOCK';
const STORAGE_SEQ_KEY = 'MC_FICHA_GRADOS_TITULOS_MOCK_SEQ';
const LATENCIA_MS = 400;

/** Puntajes simulados según tabla de valoración (RV001). */
const PUNTAJE_POR_NIVEL: Record<string, number> = {
  '1': 10,
  '2': 8,
  '3': 4,
  '4': 2,
  doctorado: 10,
  maestría: 8,
  maestria: 8,
  licenciatura: 4,
  bachiller: 2,
};

/**
 * Mock del rubro C hasta disponer del API `ficha-grados-titulos`.
 * Persiste ítems por `fichaId` en localStorage.
 */
@Injectable({ providedIn: 'root' })
export class FichaGradosTitulosMockAdapter {
  obtenerRubroGradosTitulos(fichaId: string): Observable<RubroGradosTitulos> {
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

  upsertGradoTitulo(fichaId: string, item: GradoTitulo): Observable<RubroGradosTitulos> {
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

    const guardado: GradoTitulo = {
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

  eliminarGradoTitulo(fichaId: string, itemId: string): Observable<RubroGradosTitulos> {
    const id = fichaId?.trim() ?? '';
    const idItem = itemId?.trim() ?? '';
    if (!id || !esIdPersistidoApi(idItem)) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Identificador de grado no válido.',
          })
      );
    }

    const almacen = this.leerAlmacen();
    const items = (almacen[id] ?? []).filter((item) => item.id !== idItem);
    almacen[id] = items;
    this.guardarAlmacen(almacen);

    return of(this.aRubro(items)).pipe(delay(LATENCIA_MS));
  }

  private calcularPuntaje(item: GradoTitulo): number {
    const porId = PUNTAJE_POR_NIVEL[item.gradoAcademicoId.trim()];
    if (porId != null) {
      return porId;
    }

    const nombre = item.gradoAcademicoNombre.trim().toLowerCase();
    return PUNTAJE_POR_NIVEL[nombre] ?? 4;
  }

  private aRubro(items: GradoTitulo[]): RubroGradosTitulos {
    const puntajeTotal = items.reduce((sum, item) => sum + (Number(item.puntaje) || 0), 0);
    return {
      items: structuredClone(items),
      puntajeTotal,
    };
  }

  private leerRubro(fichaId: string): RubroGradosTitulos {
    const items = this.leerAlmacen()[fichaId] ?? [];
    if (!items.length) {
      return crearRubroGradosTitulosVacio();
    }
    return this.aRubro(items);
  }

  private leerAlmacen(): Record<string, GradoTitulo[]> {
    try {
      const crudo = localStorage.getItem(STORAGE_KEY);
      if (!crudo) {
        return {};
      }
      return JSON.parse(crudo) as Record<string, GradoTitulo[]>;
    } catch {
      return {};
    }
  }

  private guardarAlmacen(almacen: Record<string, GradoTitulo[]>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(almacen));
  }

  private siguienteId(): number {
    const actual = Number(localStorage.getItem(STORAGE_SEQ_KEY) ?? '1000');
    const siguiente = Number.isFinite(actual) && actual >= 1000 ? actual + 1 : 1001;
    localStorage.setItem(STORAGE_SEQ_KEY, String(siguiente));
    return siguiente;
  }
}
