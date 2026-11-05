import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, take } from 'rxjs';
import { detalleDeResultado } from '../../../../../../application/errors/detalle-error.mapper';
import { ObtenerPuntajesFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-puntajes-ficha.use-case';
import {
  FichaValoracion,
  PuntajesFicha,
  puntajeRubroDe,
} from '../../../../../../domain/models/ficha-valoracion.model';
import { RubroAmag } from '../../../../../../domain/models/rubro-amag.model';
import { RubroAntiguedad } from '../../../../../../domain/models/rubro-antiguedad.model';
import { RubroAsistenciasEventos } from '../../../../../../domain/models/rubro-asistencias-eventos.model';
import { RubroCertamenesAcademicos } from '../../../../../../domain/models/rubro-certamenes-academicos.model';
import { RubroCursosEspecializacion } from '../../../../../../domain/models/rubro-cursos-especializacion.model';
import { RubroDemerito } from '../../../../../../domain/models/rubro-demerito.model';
import { RubroDistincion } from '../../../../../../domain/models/rubro-distincion.model';
import { RubroDocencia } from '../../../../../../domain/models/rubro-docencia.model';
import { RubroEstudiosPosgrado } from '../../../../../../domain/models/rubro-estudios-posgrado.model';
import { RubroGradosTitulos } from '../../../../../../domain/models/rubro-grados-titulos.model';
import { RubroIdioma } from '../../../../../../domain/models/rubro-idioma.model';
import { RubroMaestro } from '../../../../../../domain/models/rubro-maestro.model';
import { RubroOfimatica } from '../../../../../../domain/models/rubro-ofimatica.model';
import { RubroPasantias } from '../../../../../../domain/models/rubro-pasantias.model';
import { RubroPublicacionJuridica } from '../../../../../../domain/models/rubro-publicacion-juridica.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { RubrosMaestroStore } from '../../../../../../infrastructure/stores/rubros-maestro.store';
import { RubroAmagComponent } from '../rubro-amag/rubro-amag';
import { RubroAntiguedadComponent } from '../rubro-antiguedad/rubro-antiguedad';
import { RubroDemeritoComponent } from '../rubro-demerito/rubro-demerito';
import { RubroDistincionComponent } from '../rubro-distincion/rubro-distincion';
import { RubroDocenciaComponent } from '../rubro-docencia/rubro-docencia';
import { RubroGradosTitulosComponent } from '../rubro-grados-titulos/rubro-grados-titulos';
import { RubroIdiomaComponent } from '../rubro-idioma/rubro-idioma';
import { RubroProduccion } from '../rubro-produccion/rubro-produccion';
import { RubroPublicacionJuridicaComponent } from '../rubro-publicacion-juridica/rubro-publicacion-juridica';
import { RubroSubrubrosPanel } from '../rubro-subrubros-panel/rubro-subrubros-panel';
import { formatearPuntaje } from '../rubros.util';
import {
  CargadorRubro,
  CODIGOS_RUBRO,
  CODIGOS_SUBRUBRO_E,
  CodigoRubro,
  CONFIG_RUBROS,
  configRubro,
  esCodigoRubro,
  RubrosPorCodigo,
} from './rubros-panel.config';

/** Estado de un rubro en el panel. */
interface EstadoRubro<T> {
  /** Detalle mostrado (inicial del registro o cargado del API). */
  datos: T | null;
  puntaje: number;
  cargando: boolean;
}

/** Un valor por cada rubro del panel. */
function porRubro<V>(crear: (codigo: CodigoRubro) => V): Record<CodigoRubro, V> {
  return Object.fromEntries(CODIGOS_RUBRO.map((codigo) => [codigo, crear(codigo)])) as Record<
    CodigoRubro,
    V
  >;
}

@Component({
  selector: 'app-rubros-panel',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatProgressSpinnerModule,
    RubroProduccion,
    RubroAntiguedadComponent,
    RubroGradosTitulosComponent,
    RubroAmagComponent,
    RubroIdiomaComponent,
    RubroPublicacionJuridicaComponent,
    RubroDistincionComponent,
    RubroDocenciaComponent,
    RubroDemeritoComponent,
    RubroSubrubrosPanel,
  ],
  templateUrl: './rubros-panel.html',
  styleUrl: './rubros-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubrosPanel {
  private readonly destroyRef = inject(DestroyRef);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly obtenerPuntajes = inject(ObtenerPuntajesFichaUseCase);
  private readonly rubrosMaestroStore = inject(RubrosMaestroStore);
  private solicitudPuntajes = 0;

  readonly fechaValoracion = input<string | null>(null);
  readonly fichaId = input<string | null>(null);
  readonly nivelId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroAntiguedad = input<RubroAntiguedad | null>(null);
  readonly rubroGradosTitulos = input<RubroGradosTitulos | null>(null);
  readonly rubroAmag = input<RubroAmag | null>(null);
  readonly rubroIdioma = input<RubroIdioma | null>(null);
  readonly rubroPublicacionJuridica = input<RubroPublicacionJuridica | null>(null);
  readonly rubroDistincion = input<RubroDistincion | null>(null);
  readonly rubroDocencia = input<RubroDocencia | null>(null);
  readonly rubroDemerito = input<RubroDemerito | null>(null);
  readonly rubroEstudiosPosgrado = input<RubroEstudiosPosgrado | null>(null);
  readonly rubroPasantias = input<RubroPasantias | null>(null);
  readonly rubroCursosEspecializacion = input<RubroCursosEspecializacion | null>(null);
  readonly rubroCertamenesAcademicos = input<RubroCertamenesAcademicos | null>(null);
  readonly rubroAsistenciasEventos = input<RubroAsistenciasEventos | null>(null);
  readonly rubroOfimatica = input<RubroOfimatica | null>(null);
  /** Puntaje oficial del código E. No se recalcula al abrir los subrubros. */
  readonly puntajeRubroE = input(0);
  readonly rubrosMaestro = input<RubroMaestro[]>([]);

  readonly fichaActualizada = output<FichaValoracion>();
  readonly puntajesOficiales = output<PuntajesFicha>();
  readonly rubroAntiguedadCargado = output<RubroAntiguedad>();
  readonly rubroGradosTitulosCargado = output<RubroGradosTitulos>();
  readonly rubroAmagCargado = output<RubroAmag>();
  readonly rubroIdiomaCargado = output<RubroIdioma>();
  readonly rubroPublicacionJuridicaCargado = output<RubroPublicacionJuridica>();
  readonly rubroDistincionCargado = output<RubroDistincion>();
  readonly rubroDocenciaCargado = output<RubroDocencia>();
  readonly rubroDemeritoCargado = output<RubroDemerito>();
  readonly rubroEstudiosPosgradoCargado = output<RubroEstudiosPosgrado>();
  readonly rubroPasantiasCargado = output<RubroPasantias>();
  readonly rubroCursosEspecializacionCargado = output<RubroCursosEspecializacion>();
  readonly rubroCertamenesAcademicosCargado = output<RubroCertamenesAcademicos>();
  readonly rubroAsistenciasEventosCargado = output<RubroAsistenciasEventos>();
  readonly rubroOfimaticaCargado = output<RubroOfimatica>();

  protected readonly formatearPuntaje = formatearPuntaje;
  protected readonly puntajeRubroEOficial = signal(0);

  /** Detalle que entrega el registro para cada rubro. */
  private readonly entradas: { [K in CodigoRubro]: InputSignal<RubrosPorCodigo[K] | null> } = {
    B: this.rubroAntiguedad,
    C: this.rubroGradosTitulos,
    D: this.rubroAmag,
    F: this.rubroIdioma,
    G: this.rubroPublicacionJuridica,
    H: this.rubroDistincion,
    I: this.rubroDocencia,
    J: this.rubroDemerito,
    E1: this.rubroEstudiosPosgrado,
    E2: this.rubroPasantias,
    E3: this.rubroCursosEspecializacion,
    E4: this.rubroCertamenesAcademicos,
    E5: this.rubroAsistenciasEventos,
    E6: this.rubroOfimatica,
  };

  /** Aviso al registro cuando se carga el detalle de cada rubro. */
  private readonly salidas: { [K in CodigoRubro]: OutputEmitterRef<RubrosPorCodigo[K]> } = {
    B: this.rubroAntiguedadCargado,
    C: this.rubroGradosTitulosCargado,
    D: this.rubroAmagCargado,
    F: this.rubroIdiomaCargado,
    G: this.rubroPublicacionJuridicaCargado,
    H: this.rubroDistincionCargado,
    I: this.rubroDocenciaCargado,
    J: this.rubroDemeritoCargado,
    E1: this.rubroEstudiosPosgradoCargado,
    E2: this.rubroPasantiasCargado,
    E3: this.rubroCursosEspecializacionCargado,
    E4: this.rubroCertamenesAcademicosCargado,
    E5: this.rubroAsistenciasEventosCargado,
    E6: this.rubroOfimaticaCargado,
  };

  private readonly cargadores: Record<CodigoRubro, CargadorRubro<unknown>> = porRubro((codigo) =>
    inject(configRubro(codigo).cargador)
  );

  private readonly estados: Record<CodigoRubro, WritableSignal<EstadoRubro<unknown>>> = porRubro(
    () => signal<EstadoRubro<unknown>>({ datos: null, puntaje: 0, cargando: false })
  );

  /** Ficha para la que ya se cargó el detalle de cada rubro (evita pedirlo de nuevo). */
  private readonly cargadoPara: Partial<Record<CodigoRubro, string>> = {};

  private cargoPrevio: { fichaId: string | null; nivelId: string | null } | null = null;

  constructor() {
    // Mientras un rubro no se haya cargado del API para esta ficha, refleja lo que entrega el registro.
    effect(() => {
      const fichaId = this.fichaId();
      const iniciales = porRubro((codigo) => this.entradas[codigo]());
      const puntajeE = this.puntajeRubroE();

      untracked(() => {
        this.puntajeRubroEOficial.set(puntajeE);
        for (const codigo of CODIGOS_RUBRO) {
          if (fichaId && fichaId === this.cargadoPara[codigo]) {
            continue;
          }
          delete this.cargadoPara[codigo];
          const inicial = iniciales[codigo];
          this.actualizarEstado(codigo, {
            datos: inicial,
            puntaje: configRubro(codigo).puntaje(inicial),
          });
        }
      });
    });

    // Al cambiar el cargo de la misma ficha, el backend recalcula antigüedad y puntaje.
    effect(() => {
      const fichaId = this.fichaId();
      const nivelId = this.nivelId();
      untracked(() => {
        const previo = this.cargoPrevio;
        this.cargoPrevio = { fichaId, nivelId };
        if (
          !fichaId ||
          previo?.fichaId !== fichaId ||
          !previo.nivelId ||
          previo.nivelId === nivelId
        ) {
          return;
        }
        if (this.cargadoPara.B === fichaId) {
          delete this.cargadoPara.B;
          this.cargarRubro('B', fichaId);
        }
        this.refrescarPuntajesOficiales(fichaId);
      });
    });
  }

  // ---- Lectura desde la plantilla ----

  protected datos<K extends CodigoRubro>(codigo: K): RubrosPorCodigo[K] | null {
    return this.estados[codigo]().datos as RubrosPorCodigo[K] | null;
  }

  protected cargando(codigo: CodigoRubro): boolean {
    return this.estados[codigo]().cargando;
  }

  protected puntaje(codigo: CodigoRubro): number {
    return this.estados[codigo]().puntaje;
  }

  /** Puntaje que se muestra en la cabecera de cada rubro del catálogo. */
  protected puntajeRubro(codigo: string): number {
    if (codigo === 'E') {
      return this.puntajeRubroEOficial();
    }
    return esCodigoRubro(codigo) ? this.puntaje(codigo) : 0;
  }

  protected cargandoRubro(rubro: RubroMaestro): boolean {
    return esCodigoRubro(rubro.codigo) && this.cargando(rubro.codigo);
  }

  protected mensajeCargaRubro(rubro: RubroMaestro): string {
    const texto = esCodigoRubro(rubro.codigo)
      ? CONFIG_RUBROS[rubro.codigo].textoCarga
      : undefined;
    return texto ?? 'Cargando…';
  }

  protected expandidoPorDefecto(codigo: string): boolean {
    const primeroConDetalle = this.rubrosMaestro().find((rubro) => rubro.tieneDetalle);
    return primeroConDetalle ? primeroConDetalle.codigo === codigo : codigo === 'B';
  }

  // ---- Eventos ----

  protected onRubroAbierto(rubro: RubroMaestro): void {
    const fichaId = this.fichaId();

    if (rubro.tieneSubrubros) {
      this.cargarSubrubros(rubro);
      if (rubro.codigo === 'E' && fichaId) {
        for (const codigo of CODIGOS_SUBRUBRO_E) {
          this.cargarSiHaceFalta(codigo, fichaId);
        }
      }
      return;
    }

    if (fichaId && esCodigoRubro(rubro.codigo)) {
      this.cargarSiHaceFalta(rubro.codigo, fichaId);
    }
  }

  /** El componente del rubro avisa un nuevo puntaje (p. ej. tras recalcular). */
  protected onPuntaje(codigo: CodigoRubro, puntaje: number): void {
    this.actualizarEstado(codigo, { puntaje });
  }

  protected onFichaActualizada(ficha: FichaValoracion): void {
    for (const codigo of CODIGOS_RUBRO) {
      const config = configRubro(codigo);
      const detalle = config.deFicha(ficha);
      this.actualizarEstado(codigo, {
        puntaje: config.puntaje(detalle),
        ...(config.datosDesdeFicha && detalle ? { datos: detalle } : {}),
      });
    }
    this.puntajeRubroEOficial.set(ficha.puntajeRubroE ?? 0);
    this.fichaActualizada.emit(ficha);
    this.refrescarPuntajesOficiales(ficha.id);
  }

  // ---- Carga del detalle ----

  private cargarSiHaceFalta(codigo: CodigoRubro, fichaId: string): void {
    if (this.cargadoPara[codigo] === fichaId || this.cargando(codigo)) {
      return;
    }
    this.cargarRubro(codigo, fichaId);
  }

  private cargarRubro(codigo: CodigoRubro, fichaId: string): void {
    const config = configRubro(codigo);
    this.actualizarEstado(codigo, { cargando: true });

    this.cargadores[codigo]
      .ejecutar(fichaId)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.actualizarEstado(codigo, { cargando: false }))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          const tipo = codigo.startsWith('E') ? 'subrubro' : 'rubro';
          void this.alertas.error(
            `No se pudo cargar el ${tipo} ${codigo}`,
            detalleDeResultado(resultado)
          );
          return;
        }

        this.cargadoPara[codigo] = fichaId;
        this.actualizarEstado(codigo, {
          datos: resultado.rubro,
          puntaje: config.puntaje(resultado.rubro),
        });
        (this.salidas[codigo] as OutputEmitterRef<unknown>).emit(resultado.rubro);
      });
  }

  private cargarSubrubros(rubro: RubroMaestro): void {
    this.rubrosMaestroStore
      .asegurarSubrubrosCargados(rubro.idRubro)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((exito) => {
        if (exito) {
          return;
        }

        void this.alertas.error(`No se pudieron cargar los subrubros del rubro ${rubro.codigo}`, {
          mensaje:
            this.rubrosMaestroStore.errorSubrubros(rubro.idRubro) ??
            'No se pudo obtener el catálogo de subrubros.',
        });
      });
  }

  // ---- Puntajes oficiales ----

  private refrescarPuntajesOficiales(fichaId: string): void {
    const id = fichaId?.trim() ?? '';
    if (!id) {
      return;
    }

    const solicitud = ++this.solicitudPuntajes;
    this.obtenerPuntajes
      .ejecutar(id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((resultado) => {
        if (solicitud !== this.solicitudPuntajes || this.fichaId() !== id || !resultado.exito) {
          return;
        }

        this.aplicarPuntajesOficiales(resultado.puntajes);
        this.puntajesOficiales.emit(resultado.puntajes);
      });
  }

  private aplicarPuntajesOficiales(puntajes: PuntajesFicha): void {
    for (const codigo of CODIGOS_RUBRO) {
      const puntaje = puntajeRubroDe(puntajes, codigo);
      if (puntaje == null) {
        continue;
      }
      const datos = this.estados[codigo]().datos;
      this.actualizarEstado(codigo, {
        puntaje,
        ...(datos ? { datos: configRubro(codigo).conPuntaje(datos, puntaje) } : {}),
      });
    }

    const puntajeE = puntajeRubroDe(puntajes, 'E');
    if (puntajeE != null) {
      this.puntajeRubroEOficial.set(puntajeE);
    }
  }

  private actualizarEstado(codigo: CodigoRubro, cambios: Partial<EstadoRubro<unknown>>): void {
    this.estados[codigo].update((estado) => ({ ...estado, ...cambios }));
  }
}
