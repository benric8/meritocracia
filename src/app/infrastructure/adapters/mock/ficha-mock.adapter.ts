import { inject, Injectable } from '@angular/core';
import { delay, map, Observable, of, switchMap, throwError } from 'rxjs';
import { ErrorNegocioApi } from '../../../domain/errors/error-negocio-api';
import {
  ActualizarDatosPersonalesFicha,
  CrearBorradorFicha,
  crearRubroAntiguedadVacio,
  crearRubroAmagVacio,
  crearRubroGradosTitulosVacio,
  FichaValoracion,
  ResultadoResolverFicha,
} from '../../../domain/models/ficha-valoracion.model';
import {
  Colegiatura,
  PeriodoNivelAnterior,
  Provisionalidad,
  RubroAntiguedad,
  TitularidadActual,
} from '../../../domain/models/rubro-antiguedad.model';
import {
  EstudioAmag,
  RubroAmag,
} from '../../../domain/models/rubro-amag.model';
import {
  GradoTitulo,
  RubroGradosTitulos,
} from '../../../domain/models/rubro-grados-titulos.model';
import { TIEMPO_SERVICIO_CERO } from '../../../domain/models/tiempo-servicio.model';
import { ANTIGUEDAD_PORT } from '../../../domain/ports/antiguedad.port';
import { FichaPort } from '../../../domain/ports/ficha.port';

const STORAGE_KEY = 'MC_FICHAS_VALORACION_MOCK';
const LATENCIA_MS = 400;

/**
 * Mock de ficha: localStorage + semillas.
 * Cálculos de tiempo/puntaje vía AntiguedadPort (misma fuente que usará el back).
 */
@Injectable({ providedIn: 'root' })
export class FichaMockAdapter implements FichaPort {
  private readonly antiguedad = inject(ANTIGUEDAD_PORT);

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
      .filter((f) => f.datosPersonales.dni === dniNorm && f.fechaValoracionId !== fechaId)
      .sort((a, b) => b.fechaValoracionSnapshot.localeCompare(a.fechaValoracionSnapshot));

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
      return throwError(() => new ErrorNegocioApi({ mensaje: 'El DNI debe tener 8 dígitos.' }));
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
    const nueva: FichaValoracion = {
      id: `ficha-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      estado: 'BORRADOR',
      nivelId: peticion.nivelId.trim(),
      nivelNombre: peticion.nivelNombre.trim(),
      fechaValoracionId: peticion.fechaValoracionId.trim(),
      fechaValoracionSnapshot: peticion.fechaValoracionSnapshot.trim().slice(0, 10),
      datosPersonales: this.normalizarDatos(peticion.datosPersonales),
      fichaPreviaId: peticion.arrastrarDesdeFichaId?.trim() || null,
      rubroAntiguedad: crearRubroAntiguedadVacio(),
      rubroGradosTitulos: crearRubroGradosTitulosVacio(),
      rubroAmag: crearRubroAmagVacio(),
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
    return this.conFichaEditable(fichaId, (actual) => ({
      ...actual,
      nivelId: peticion.nivelId.trim(),
      nivelNombre: peticion.nivelNombre.trim(),
      datosPersonales: this.normalizarDatos(peticion.datosPersonales),
      actualizadoEn: new Date().toISOString(),
    }));
  }

  obtenerPorId(fichaId: string): Observable<FichaValoracion> {
    const ficha = this.buscar(fichaId);
    if (!ficha) {
      return throwError(
        () => new ErrorNegocioApi({ mensaje: 'No se encontró la ficha solicitada.' })
      );
    }
    return of(ficha).pipe(delay(LATENCIA_MS));
  }

  obtenerRubroAntiguedad(fichaId: string): Observable<RubroAntiguedad> {
    const ficha = this.buscar(fichaId);
    if (!ficha) {
      return throwError(
        () => new ErrorNegocioApi({ mensaje: 'No se encontró la ficha solicitada.' })
      );
    }
    return of(ficha.rubroAntiguedad ?? crearRubroAntiguedadVacio()).pipe(delay(LATENCIA_MS));
  }

  guardarTitularidad(
    fichaId: string,
    data: TitularidadActual,
    antiguedadId?: string | null
  ): Observable<FichaValoracion> {
    const ficha = this.buscar(fichaId);
    if (!ficha) {
      return throwError(() => new ErrorNegocioApi({ mensaje: 'No se encontró la ficha.' }));
    }
    if (!this.esEditable(ficha.fechaValoracionSnapshot)) {
      return throwError(() => new ErrorNegocioApi({ mensaje: 'La ficha está cerrada.' }));
    }

    const snapshot = ficha.fechaValoracionSnapshot;
    return this.antiguedad
      .calcularTiempoTitular({
        fechaJuramentacion: data.fechaJuramentacion ?? '',
        fechaCese: data.fechaCese,
        fechaReincorporacion: data.fechaReincorporacion,
        fechaValoracion: snapshot,
      })
      .pipe(
        switchMap((tiempo) =>
          this.antiguedad.calcularPuntajePorAnios(tiempo).pipe(
            map((puntaje) => {
              const rubro = this.asegurarRubro(ficha);
              const idExistente = antiguedadId?.trim() || rubro.id;
              if (!idExistente) {
                rubro.id = `ant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
              } else {
                rubro.id = idExistente;
              }
              rubro.titularidad = {
                ...data,
                fechaValoracion: snapshot,
                tiempoTotal: tiempo,
                puntaje,
              };
              return this.persistirRubro(ficha, rubro);
            })
          )
        ),
        delay(LATENCIA_MS)
      );
  }

  guardarPeriodoNivelAnterior(
    fichaId: string,
    data: PeriodoNivelAnterior
  ): Observable<FichaValoracion> {
    const ficha = this.buscar(fichaId);
    if (!ficha) {
      return throwError(() => new ErrorNegocioApi({ mensaje: 'No se encontró la ficha.' }));
    }
    if (!this.esEditable(ficha.fechaValoracionSnapshot)) {
      return throwError(() => new ErrorNegocioApi({ mensaje: 'La ficha está cerrada.' }));
    }

    const rubroBase = this.asegurarRubro(ficha);
    if (!rubroBase.id) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Guarde primero la titularidad (antigüedad) antes de registrar criterios de desempate.',
          })
      );
    }

    const inicio = data.fechaInicio ?? '';
    const fin = data.fechaFin ?? '';
    const calc$ =
      inicio && fin
        ? this.antiguedad.calcularTiempo(inicio, fin)
        : of(TIEMPO_SERVICIO_CERO);

    return calc$.pipe(
      map((tiempo) => {
        const rubro = this.asegurarRubro(ficha);
        rubro.periodoNivelAnterior = {
          ...data,
          id: data.id ?? rubro.periodoNivelAnterior.id ?? `per-${Date.now()}`,
          tiempoTotal: tiempo,
        };
        return this.persistirRubro(ficha, rubro);
      }),
      delay(LATENCIA_MS)
    );
  }

  upsertProvisionalidad(fichaId: string, item: Provisionalidad): Observable<FichaValoracion> {
    return this.mutarLista(fichaId, (rubro) => {
      const idx = rubro.provisionalidades.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        rubro.provisionalidades[idx] = item;
      } else {
        rubro.provisionalidades = [...rubro.provisionalidades, item];
      }
      return this.antiguedad.sumarTiempos(rubro.provisionalidades.map((p) => p.tiempoTotal)).pipe(
        map((suma) => {
          rubro.sumaProvisionalidades = suma;
          return rubro;
        })
      );
    });
  }

  eliminarProvisionalidad(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.mutarLista(fichaId, (rubro) => {
      rubro.provisionalidades = rubro.provisionalidades.filter((p) => p.id !== itemId);
      return this.antiguedad.sumarTiempos(rubro.provisionalidades.map((p) => p.tiempoTotal)).pipe(
        map((suma) => {
          rubro.sumaProvisionalidades = suma;
          return rubro;
        })
      );
    });
  }

  upsertColegiatura(fichaId: string, item: Colegiatura): Observable<FichaValoracion> {
    const ficha = this.buscar(fichaId);
    if (!ficha) {
      return throwError(() => new ErrorNegocioApi({ mensaje: 'No se encontró la ficha.' }));
    }
    if (!this.esEditable(ficha.fechaValoracionSnapshot)) {
      return throwError(() => new ErrorNegocioApi({ mensaje: 'La ficha está cerrada.' }));
    }

    const rubroExistente = this.asegurarRubro(ficha);
    if (!rubroExistente.id) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Guarde primero la titularidad (antigüedad) antes de registrar criterios de desempate.',
          })
      );
    }

    return this.antiguedad
      .calcularAniosColegiatura(item.fechaColegiatura, ficha.fechaValoracionSnapshot)
      .pipe(
        map((anios) => {
          const rubro = this.asegurarRubro(ficha);
          const actualizado = { ...item, anios };
          const idx = rubro.colegiaturas.findIndex((c) => c.id === actualizado.id);
          if (idx >= 0) {
            rubro.colegiaturas[idx] = actualizado;
          } else {
            rubro.colegiaturas = [...rubro.colegiaturas, actualizado];
          }
          return this.persistirRubro(ficha, rubro);
        }),
        delay(LATENCIA_MS)
      );
  }

  eliminarColegiatura(fichaId: string, itemId: string): Observable<FichaValoracion> {
    const ficha = this.buscar(fichaId);
    if (!ficha) {
      return throwError(() => new ErrorNegocioApi({ mensaje: 'No se encontró la ficha.' }));
    }
    const rubroCheck = this.asegurarRubro(ficha);
    if (!rubroCheck.id) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Guarde primero la titularidad (antigüedad) antes de registrar criterios de desempate.',
          })
      );
    }

    return this.conFichaEditable(fichaId, (actual) => {
      const rubro = this.asegurarRubro(actual);
      rubro.colegiaturas = rubro.colegiaturas.filter((c) => c.id !== itemId);
      return this.persistirRubro(actual, rubro, false);
    });
  }

  obtenerRubroGradosTitulos(fichaId: string): Observable<RubroGradosTitulos> {
    const ficha = this.buscar(fichaId);
    if (!ficha) {
      return throwError(() => new ErrorNegocioApi({ mensaje: 'No se encontró la ficha.' }));
    }
    return of(ficha.rubroGradosTitulos ?? crearRubroGradosTitulosVacio()).pipe(delay(LATENCIA_MS));
  }

  upsertGradoTitulo(fichaId: string, item: GradoTitulo): Observable<FichaValoracion> {
    return this.conFichaEditable(fichaId, (ficha) => {
      const rubro = ficha.rubroGradosTitulos ?? crearRubroGradosTitulosVacio();
      const guardado: GradoTitulo = {
        ...item,
        id: item.id || `grado-${Date.now()}`,
      };
      const idx = rubro.items.findIndex((actual) => actual.id === guardado.id);
      const items =
        idx >= 0
          ? rubro.items.map((actual, i) => (i === idx ? guardado : actual))
          : [...rubro.items, guardado];
      const puntajeTotal = items.reduce((sum, actual) => sum + (actual.puntaje || 0), 0);
      return {
        ...ficha,
        rubroGradosTitulos: { items, puntajeTotal },
        actualizadoEn: new Date().toISOString(),
      };
    });
  }

  eliminarGradoTitulo(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.conFichaEditable(fichaId, (ficha) => {
      const rubro = ficha.rubroGradosTitulos ?? crearRubroGradosTitulosVacio();
      const items = rubro.items.filter((item) => item.id !== itemId);
      const puntajeTotal = items.reduce((sum, actual) => sum + (actual.puntaje || 0), 0);
      return {
        ...ficha,
        rubroGradosTitulos: { items, puntajeTotal },
        actualizadoEn: new Date().toISOString(),
      };
    });
  }

  obtenerRubroAmag(fichaId: string): Observable<RubroAmag> {
    const ficha = this.buscar(fichaId);
    if (!ficha) {
      return throwError(() => new ErrorNegocioApi({ mensaje: 'No se encontró la ficha.' }));
    }
    return of(ficha.rubroAmag ?? crearRubroAmagVacio()).pipe(delay(LATENCIA_MS));
  }

  upsertEstudioAmag(fichaId: string, item: EstudioAmag): Observable<FichaValoracion> {
    return this.conFichaEditable(fichaId, (ficha) => {
      const rubro = ficha.rubroAmag ?? crearRubroAmagVacio();
      const guardado: EstudioAmag = {
        ...item,
        id: item.id || `amag-${Date.now()}`,
      };
      const idx = rubro.items.findIndex((actual) => actual.id === guardado.id);
      const items =
        idx >= 0
          ? rubro.items.map((actual, i) => (i === idx ? guardado : actual))
          : [...rubro.items, guardado];
      const puntajeTotal = items.reduce((sum, actual) => sum + (actual.puntaje || 0), 0);
      return {
        ...ficha,
        rubroAmag: { items, puntajeTotal },
        actualizadoEn: new Date().toISOString(),
      };
    });
  }

  eliminarEstudioAmag(fichaId: string, itemId: string): Observable<FichaValoracion> {
    return this.conFichaEditable(fichaId, (ficha) => {
      const rubro = ficha.rubroAmag ?? crearRubroAmagVacio();
      const items = rubro.items.filter((item) => item.id !== itemId);
      const puntajeTotal = items.reduce((sum, actual) => sum + (actual.puntaje || 0), 0);
      return {
        ...ficha,
        rubroAmag: { items, puntajeTotal },
        actualizadoEn: new Date().toISOString(),
      };
    });
  }

  private mutarLista(
    fichaId: string,
    mutar: (rubro: RubroAntiguedad) => Observable<RubroAntiguedad>
  ): Observable<FichaValoracion> {
    const ficha = this.buscar(fichaId);
    if (!ficha) {
      return throwError(() => new ErrorNegocioApi({ mensaje: 'No se encontró la ficha.' }));
    }
    if (!this.esEditable(ficha.fechaValoracionSnapshot)) {
      return throwError(() => new ErrorNegocioApi({ mensaje: 'La ficha está cerrada.' }));
    }

    const rubro = this.asegurarRubro(ficha);
    if (!rubro.id) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Guarde primero la titularidad (antigüedad) antes de registrar criterios de desempate.',
          })
      );
    }

    return mutar(rubro).pipe(
      map((actualizado) => this.persistirRubro(ficha, actualizado)),
      delay(LATENCIA_MS)
    );
  }

  private conFichaEditable(
    fichaId: string,
    mapear: (ficha: FichaValoracion) => FichaValoracion
  ): Observable<FichaValoracion> {
    const almacen = this.leerAlmacen();
    const indice = almacen.findIndex((f) => f.id === fichaId.trim());
    if (indice < 0) {
      return throwError(() => new ErrorNegocioApi({ mensaje: 'No se encontró la ficha.' }));
    }
    if (!this.esEditable(almacen[indice].fechaValoracionSnapshot)) {
      return throwError(() => new ErrorNegocioApi({ mensaje: 'La ficha está cerrada.' }));
    }

    const actualizada = mapear(almacen[indice]);
    almacen[indice] = actualizada;
    this.guardarAlmacen(almacen);
    return of(actualizada).pipe(delay(LATENCIA_MS));
  }

  private persistirRubro(
    ficha: FichaValoracion,
    rubro: RubroAntiguedad,
    persistir = true
  ): FichaValoracion {
    const actualizada: FichaValoracion = {
      ...ficha,
      rubroAntiguedad: rubro,
      puntajeTotal: rubro.titularidad.puntaje,
      actualizadoEn: new Date().toISOString(),
    };

    if (persistir) {
      const almacen = this.leerAlmacen();
      const indice = almacen.findIndex((f) => f.id === ficha.id);
      if (indice >= 0) {
        almacen[indice] = actualizada;
        this.guardarAlmacen(almacen);
      }
    }

    return actualizada;
  }

  private asegurarRubro(ficha: FichaValoracion): RubroAntiguedad {
    return ficha.rubroAntiguedad
      ? structuredClone(ficha.rubroAntiguedad)
      : crearRubroAntiguedadVacio();
  }

  private buscar(fichaId: string): FichaValoracion | undefined {
    return this.leerAlmacen().find((f) => f.id === fichaId.trim());
  }

  private esEditable(fechaValoracionSnapshot: string): boolean {
    return this.hoyIsoLocal() < fechaValoracionSnapshot.slice(0, 10);
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
      return (JSON.parse(crudo) as FichaValoracion[]).map((f) => ({
        ...f,
        rubroAntiguedad: f.rubroAntiguedad ?? null,
        rubroGradosTitulos: f.rubroGradosTitulos ?? crearRubroGradosTitulosVacio(),
        rubroAmag: f.rubroAmag ?? crearRubroAmagVacio(),
      }));
    } catch {
      const iniciales = this.datosIniciales();
      this.guardarAlmacen(iniciales);
      return iniciales;
    }
  }

  private guardarAlmacen(items: FichaValoracion[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

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
        rubroAntiguedad: null,
        rubroGradosTitulos: crearRubroGradosTitulosVacio(),
        rubroAmag: crearRubroAmagVacio(),
        puntajeTotal: 68.25,
        creadoEn: '2025-11-10T10:00:00.000Z',
        actualizadoEn: '2025-12-20T18:00:00.000Z',
      },
    ];
  }
}
