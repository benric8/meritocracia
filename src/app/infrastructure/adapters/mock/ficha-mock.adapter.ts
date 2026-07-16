import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { ErrorNegocioApi } from '../../../domain/errors/error-negocio-api';
import {
  ActualizarDatosPersonalesFicha,
  CrearBorradorFicha,
  FichaValoracion,
  ResultadoResolverFicha,
} from '../../../domain/models/ficha-valoracion.model';
import { FichaPort } from '../../../domain/ports/ficha.port';

const STORAGE_KEY = 'MC_FICHAS_VALORACION_MOCK';
const LATENCIA_MS = 400;

/**
 * Mock de ficha: localStorage + semillas de ciclos pasados para probar arrastre.
 * Sustituir por FichaHttpAdapter cuando el API esté listo.
 */
@Injectable({ providedIn: 'root' })
export class FichaMockAdapter implements FichaPort {
  resolverDelCiclo(dni: string, fechaValoracionId: string): Observable<ResultadoResolverFicha> {
    const dniNorm = dni.trim();
    const fechaId = fechaValoracionId.trim();

    if (!/^\d{8}$/.test(dniNorm) || !fechaId) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'DNI o fecha de valoración no válidos para resolver la ficha.',
          })
      );
    }

    const almacen = this.leerAlmacen();
    const delCiclo = almacen.find(
      (f) => f.datosPersonales.dni === dniNorm && f.fechaValoracionId === fechaId
    );

    if (delCiclo) {
      const editable = this.esEditable(delCiclo.fechaValoracionSnapshot);
      return of(
        editable
          ? { tipo: 'EDITABLE' as const, fichaId: delCiclo.id }
          : { tipo: 'BLOQUEADA' as const, fichaId: delCiclo.id }
      ).pipe(delay(LATENCIA_MS));
    }

    const previas = almacen
      .filter(
        (f) =>
          f.datosPersonales.dni === dniNorm && f.fechaValoracionId !== fechaId
      )
      .sort((a, b) =>
        b.fechaValoracionSnapshot.localeCompare(a.fechaValoracionSnapshot)
      );

    if (previas.length > 0) {
      return of({
        tipo: 'NUEVA_CON_PREVIA' as const,
        fichaPreviaId: previas[0].id,
      }).pipe(delay(LATENCIA_MS));
    }

    return of({ tipo: 'NUEVA' as const }).pipe(delay(LATENCIA_MS));
  }

  crearBorrador(peticion: CrearBorradorFicha): Observable<FichaValoracion> {
    const dni = peticion.datosPersonales.dni?.trim() ?? '';
    if (!/^\d{8}$/.test(dni)) {
      return throwError(
        () => new ErrorNegocioApi({ mensaje: 'El DNI debe tener 8 dígitos.' })
      );
    }

    if (!peticion.fechaValoracionId?.trim() || !peticion.fechaValoracionSnapshot?.trim()) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'No hay fecha de valoración vigente para crear la ficha.',
          })
      );
    }

    if (!this.esEditable(peticion.fechaValoracionSnapshot)) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje:
              'La fecha de valoración ya fue alcanzada. No se pueden crear fichas nuevas en este ciclo.',
          })
      );
    }

    const almacen = this.leerAlmacen();
    const duplicada = almacen.find(
      (f) =>
        f.datosPersonales.dni === dni &&
        f.fechaValoracionId === peticion.fechaValoracionId.trim()
    );

    if (duplicada) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Ya existe una ficha para este juez en la fecha de valoración vigente.',
            codigo: 'FICHA_DUPLICADA',
          })
      );
    }

    const ahora = new Date().toISOString();
    const fichaPreviaId = peticion.arrastrarDesdeFichaId?.trim() || null;

    // Fase 1: el arrastre solo registra trazabilidad; los ítems de rubros llegan en fases siguientes.
    const nueva: FichaValoracion = {
      id: `ficha-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      estado: 'BORRADOR',
      nivelId: peticion.nivelId.trim(),
      nivelNombre: peticion.nivelNombre.trim(),
      fechaValoracionId: peticion.fechaValoracionId.trim(),
      fechaValoracionSnapshot: peticion.fechaValoracionSnapshot.trim().slice(0, 10),
      datosPersonales: this.normalizarDatos(peticion.datosPersonales),
      fichaPreviaId,
      puntajeTotal: 0,
      creadoEn: ahora,
      actualizadoEn: ahora,
    };

    this.guardarAlmacen([nueva, ...almacen]);
    return of(nueva).pipe(delay(LATENCIA_MS));
  }

  actualizarDatosPersonales(
    fichaId: string,
    peticion: ActualizarDatosPersonalesFicha
  ): Observable<FichaValoracion> {
    const id = fichaId.trim();
    const almacen = this.leerAlmacen();
    const indice = almacen.findIndex((f) => f.id === id);

    if (indice < 0) {
      return throwError(
        () => new ErrorNegocioApi({ mensaje: 'No se encontró la ficha a actualizar.' })
      );
    }

    const actual = almacen[indice];
    if (!this.esEditable(actual.fechaValoracionSnapshot)) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'La ficha está cerrada: la fecha de valoración ya fue alcanzada.',
          })
      );
    }

    const actualizada: FichaValoracion = {
      ...actual,
      nivelId: peticion.nivelId.trim(),
      nivelNombre: peticion.nivelNombre.trim(),
      datosPersonales: this.normalizarDatos(peticion.datosPersonales),
      actualizadoEn: new Date().toISOString(),
    };

    almacen[indice] = actualizada;
    this.guardarAlmacen(almacen);
    return of(actualizada).pipe(delay(LATENCIA_MS));
  }

  obtenerPorId(fichaId: string): Observable<FichaValoracion> {
    const id = fichaId.trim();
    const ficha = this.leerAlmacen().find((f) => f.id === id);

    if (!ficha) {
      return throwError(
        () => new ErrorNegocioApi({ mensaje: 'No se encontró la ficha solicitada.' })
      );
    }

    return of(ficha).pipe(delay(LATENCIA_MS));
  }

  /** Editable mientras hoy &lt; fechaValoracionSnapshot (día exacto). */
  private esEditable(fechaValoracionSnapshot: string): boolean {
    const hoy = this.hoyIsoLocal();
    return hoy < fechaValoracionSnapshot.slice(0, 10);
  }

  private hoyIsoLocal(): string {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private normalizarDatos(datos: CrearBorradorFicha['datosPersonales']) {
    return {
      dni: datos.dni.trim(),
      nombreCompleto: datos.nombreCompleto.trim(),
      foto: datos.foto?.trim() ?? '',
      fechaNacimiento: datos.fechaNacimiento.trim().slice(0, 10),
      sexo: datos.sexo,
      edad: datos.edad,
    };
  }

  private leerAlmacen(): FichaValoracion[] {
    try {
      const crudo = localStorage.getItem(STORAGE_KEY);
      if (!crudo) {
        const iniciales = this.datosIniciales();
        this.guardarAlmacen(iniciales);
        return iniciales;
      }
      return JSON.parse(crudo) as FichaValoracion[];
    } catch {
      const iniciales = this.datosIniciales();
      this.guardarAlmacen(iniciales);
      return iniciales;
    }
  }

  private guardarAlmacen(items: FichaValoracion[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  /**
   * Semilla: ficha REGISTRADA de un ciclo pasado (2025) para el DNI demo 12345678,
   * de modo que al crear en el ciclo vigente se active NUEVA_CON_PREVIA.
   */
  private datosIniciales(): FichaValoracion[] {
    return [
      {
        id: 'ficha-seed-previa-2025',
        estado: 'CERRADA',
        nivelId: '1',
        nivelNombre: 'Juez Superior Titular',
        fechaValoracionId: 'fv-seed-3',
        fechaValoracionSnapshot: '2025-12-31',
        datosPersonales: {
          dni: '12345678',
          nombreCompleto: 'García López, Pedro Juan',
          foto: '',
          fechaNacimiento: '1975-03-15',
          sexo: 'M',
          edad: 50,
        },
        fichaPreviaId: null,
        puntajeTotal: 68.25,
        creadoEn: '2025-11-10T10:00:00.000Z',
        actualizadoEn: '2025-12-20T18:00:00.000Z',
      },
    ];
  }
}
