import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { AntiguedadPort } from '../../../domain/ports/antiguedad.port';
import {
  CalculoTiempoTitularParams,
  TIEMPO_SERVICIO_CERO,
  TiempoServicio,
} from '../../../domain/models/tiempo-servicio.model';

const LATENCIA_MS = 300;

@Injectable({ providedIn: 'root' })
export class AntiguedadMockAdapter implements AntiguedadPort {
  calcularTiempo(inicio: string, fin: string): Observable<TiempoServicio> {
    return of(this.diferenciaFechas(inicio, fin)).pipe(delay(LATENCIA_MS));
  }

  calcularTiempoTitular(params: CalculoTiempoTitularParams): Observable<TiempoServicio> {
    const juramentacion = params.fechaJuramentacion?.trim() ?? '';
    const valoracion = params.fechaValoracion?.trim() ?? '';
    const cese = params.fechaCese?.trim() || null;
    const reincorporacion = params.fechaReincorporacion?.trim() || null;

    if (!juramentacion || !valoracion) {
      return of(TIEMPO_SERVICIO_CERO).pipe(delay(LATENCIA_MS));
    }

    let tiempo: TiempoServicio;

    if (cese && reincorporacion) {
      const tramo1 = this.diferenciaFechas(juramentacion, cese);
      const tramo2 = this.diferenciaFechas(reincorporacion, valoracion);
      tiempo = this.sumarInterno([tramo1, tramo2]);
    } else if (cese) {
      tiempo = this.diferenciaFechas(juramentacion, cese);
    } else {
      tiempo = this.diferenciaFechas(juramentacion, valoracion);
    }

    return of(tiempo).pipe(delay(LATENCIA_MS));
  }

  calcularPuntajePorAnios(tiempo: TiempoServicio): Observable<number> {
    // Tabla mock simple: 1.5 puntos por año completo + fracción por meses.
    const puntajeBruto = tiempo.anios * 1.5 + (tiempo.meses / 12) * 1.5;
    const puntaje = Math.round(puntajeBruto * 100) / 100;
    return of(puntaje).pipe(delay(LATENCIA_MS));
  }

  calcularAniosColegiatura(
    fechaColegiatura: string,
    fechaValoracion: string
  ): Observable<number> {
    const tiempo = this.diferenciaFechas(fechaColegiatura, fechaValoracion);
    return of(Math.max(0, tiempo.anios)).pipe(delay(LATENCIA_MS));
  }

  sumarTiempos(tiempos: TiempoServicio[]): Observable<TiempoServicio> {
    return of(this.sumarInterno(tiempos)).pipe(delay(LATENCIA_MS));
  }

  private sumarInterno(tiempos: TiempoServicio[]): TiempoServicio {
    let anios = 0;
    let meses = 0;
    let dias = 0;

    for (const t of tiempos) {
      anios += t.anios;
      meses += t.meses;
      dias += t.dias;
    }

    if (dias >= 30) {
      meses += Math.floor(dias / 30);
      dias = dias % 30;
    }
    if (meses >= 12) {
      anios += Math.floor(meses / 12);
      meses = meses % 12;
    }

    return this.aTiempo(anios, meses, dias);
  }

  /**
   * Diferencia calendario aproximada (años / meses / días) entre dos ISO `YYYY-MM-DD`.
   */
  private diferenciaFechas(inicioIso: string, finIso: string): TiempoServicio {
    const inicio = this.parseIso(inicioIso);
    const fin = this.parseIso(finIso);

    if (!inicio || !fin || fin.getTime() < inicio.getTime()) {
      return TIEMPO_SERVICIO_CERO;
    }

    let anios = fin.getFullYear() - inicio.getFullYear();
    let meses = fin.getMonth() - inicio.getMonth();
    let dias = fin.getDate() - inicio.getDate();

    if (dias < 0) {
      meses -= 1;
      const mesAnterior = new Date(fin.getFullYear(), fin.getMonth(), 0);
      dias += mesAnterior.getDate();
    }

    if (meses < 0) {
      anios -= 1;
      meses += 12;
    }

    return this.aTiempo(Math.max(0, anios), Math.max(0, meses), Math.max(0, dias));
  }

  private aTiempo(anios: number, meses: number, dias: number): TiempoServicio {
    return {
      anios,
      meses,
      dias,
      etiqueta: `${anios} aa ${meses} mm ${dias} dd`,
    };
  }

  private parseIso(iso: string): Date | null {
    const value = iso?.trim().slice(0, 10) ?? '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return null;
    }
    const [y, m, d] = value.split('-').map(Number);
    const fecha = new Date(y, m - 1, d);
    if (
      fecha.getFullYear() !== y ||
      fecha.getMonth() !== m - 1 ||
      fecha.getDate() !== d
    ) {
      return null;
    }
    return fecha;
  }
}
