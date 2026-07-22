import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, take } from 'rxjs';
import { ObtenerRubroAntiguedadFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-antiguedad-ficha.use-case';
import { ObtenerRubroGradosTitulosFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-grados-titulos-ficha.use-case';
import { ObtenerRubroAmagFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-amag-ficha.use-case';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import { RubroAntiguedad } from '../../../../../../domain/models/rubro-antiguedad.model';
import { RubroAmag } from '../../../../../../domain/models/rubro-amag.model';
import { RubroGradosTitulos } from '../../../../../../domain/models/rubro-grados-titulos.model';
import { RubroMaestro } from '../../../../../../domain/models/rubro-maestro.model';
import { RubrosMaestroStore } from '../../../../../../infrastructure/stores/rubros-maestro.store';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { formatearPuntaje } from '../rubros.util';
import { RubroAmagComponent } from '../rubro-amag/rubro-amag';
import { RubroGradosTitulosComponent } from '../rubro-grados-titulos/rubro-grados-titulos';
import { RubroProduccion } from '../rubro-produccion/rubro-produccion';
import { RubroAntiguedadComponent } from '../rubro-antiguedad/rubro-antiguedad';
import { RubroSubrubrosPanel } from '../rubro-subrubros-panel/rubro-subrubros-panel';

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
    RubroSubrubrosPanel,
  ],
  templateUrl: './rubros-panel.html',
  styleUrl: './rubros-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubrosPanel {
  private readonly destroyRef = inject(DestroyRef);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly obtenerRubroAntiguedad = inject(ObtenerRubroAntiguedadFichaUseCase);
  private readonly obtenerRubroGradosTitulos = inject(ObtenerRubroGradosTitulosFichaUseCase);
  private readonly obtenerRubroAmag = inject(ObtenerRubroAmagFichaUseCase);
  private readonly rubrosMaestroStore = inject(RubrosMaestroStore);

  readonly fechaValoracion = input<string | null>(null);
  readonly fichaId = input<string | null>(null);
  readonly nivelId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroAntiguedad = input<RubroAntiguedad | null>(null);
  readonly rubroGradosTitulos = input<RubroGradosTitulos | null>(null);
  readonly rubroAmag = input<RubroAmag | null>(null);
  readonly rubrosMaestro = input<RubroMaestro[]>([]);

  readonly fichaActualizada = output<FichaValoracion>();
  readonly rubroAntiguedadCargado = output<RubroAntiguedad>();
  readonly rubroGradosTitulosCargado = output<RubroGradosTitulos>();
  readonly rubroAmagCargado = output<RubroAmag>();

  protected readonly puntajeProduccion = 0;
  protected readonly puntajeAntiguedad = signal(0);
  protected readonly puntajeGradosTitulos = signal(0);
  protected readonly puntajeAmag = signal(0);
  protected readonly rubroAntiguedadLocal = signal<RubroAntiguedad | null>(null);
  protected readonly rubroGradosTitulosLocal = signal<RubroGradosTitulos | null>(null);
  protected readonly rubroAmagLocal = signal<RubroAmag | null>(null);
  protected readonly cargandoRubroB = signal(false);
  protected readonly cargandoRubroC = signal(false);
  protected readonly cargandoRubroD = signal(false);
  protected readonly formatearPuntaje = formatearPuntaje;

  private rubroBCargadoParaFichaId: string | null = null;
  private rubroCCargadoParaFichaId: string | null = null;
  private rubroDCargadoParaFichaId: string | null = null;

  constructor() {
    effect(() => {
      const fichaId = this.fichaId();
      const inicialB = this.rubroAntiguedad();
      const inicialC = this.rubroGradosTitulos();
      const inicialD = this.rubroAmag();

      if (!fichaId || fichaId !== this.rubroBCargadoParaFichaId) {
        this.rubroBCargadoParaFichaId = null;
        this.rubroAntiguedadLocal.set(inicialB);
        this.puntajeAntiguedad.set(inicialB?.titularidad.puntaje ?? 0);
      }

      if (!fichaId || fichaId !== this.rubroCCargadoParaFichaId) {
        this.rubroCCargadoParaFichaId = null;
        this.rubroGradosTitulosLocal.set(inicialC);
        this.puntajeGradosTitulos.set(inicialC?.puntajeTotal ?? 0);
      }

      if (!fichaId || fichaId !== this.rubroDCargadoParaFichaId) {
        this.rubroDCargadoParaFichaId = null;
        this.rubroAmagLocal.set(inicialD);
        this.puntajeAmag.set(inicialD?.puntajeTotal ?? 0);
      }
    });
  }

  protected onRubroBAbierto(): void {
    const fichaId = this.fichaId();
    if (!fichaId || this.rubroBCargadoParaFichaId === fichaId || this.cargandoRubroB()) {
      return;
    }

    this.cargarRubroB(fichaId);
  }

  protected onRubroCAbierto(): void {
    const fichaId = this.fichaId();
    if (!fichaId || this.rubroCCargadoParaFichaId === fichaId || this.cargandoRubroC()) {
      return;
    }

    this.cargarRubroC(fichaId);
  }

  protected onRubroDAbierto(): void {
    const fichaId = this.fichaId();
    if (!fichaId || this.rubroDCargadoParaFichaId === fichaId || this.cargandoRubroD()) {
      return;
    }

    this.cargarRubroD(fichaId);
  }

  protected onPuntajeAntiguedad(puntaje: number): void {
    this.puntajeAntiguedad.set(puntaje);
  }

  protected onPuntajeGradosTitulos(puntaje: number): void {
    this.puntajeGradosTitulos.set(puntaje);
  }

  protected onPuntajeAmag(puntaje: number): void {
    this.puntajeAmag.set(puntaje);
  }

  protected onFichaActualizada(ficha: FichaValoracion): void {
    this.puntajeAntiguedad.set(ficha.rubroAntiguedad?.titularidad.puntaje ?? 0);
    this.puntajeGradosTitulos.set(ficha.rubroGradosTitulos?.puntajeTotal ?? 0);
    this.puntajeAmag.set(ficha.rubroAmag?.puntajeTotal ?? 0);
    this.fichaActualizada.emit(ficha);
  }

  protected expandidoPorDefecto(codigo: string): boolean {
    const rubros = this.rubrosMaestro();
    const primeroConDetalle = rubros.find((rubro) => rubro.tieneDetalle);
    if (primeroConDetalle) {
      return primeroConDetalle.codigo === codigo;
    }
    return codigo === 'B';
  }

  protected onRubroAbierto(rubro: RubroMaestro): void {
    if (rubro.tieneSubrubros) {
      this.cargarSubrubros(rubro);
      return;
    }

    switch (rubro.codigo) {
      case 'B':
        this.onRubroBAbierto();
        break;
      case 'C':
        this.onRubroCAbierto();
        break;
      case 'D':
        this.onRubroDAbierto();
        break;
    }
  }

  protected puntajeRubro(codigo: string): number {
    switch (codigo) {
      case 'A':
        return this.puntajeProduccion;
      case 'B':
        return this.puntajeAntiguedad();
      case 'C':
        return this.puntajeGradosTitulos();
      case 'D':
        return this.puntajeAmag();
      default:
        return 0;
    }
  }

  protected cargandoRubro(rubro: RubroMaestro): boolean {
    return this.cargandoRubroPorCodigo(rubro.codigo);
  }

  protected mensajeCargaRubro(rubro: RubroMaestro): string {
    return this.mensajeCargaRubroPorCodigo(rubro.codigo);
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

  private cargandoRubroPorCodigo(codigo: string): boolean {
    switch (codigo) {
      case 'B':
        return this.cargandoRubroB();
      case 'C':
        return this.cargandoRubroC();
      case 'D':
        return this.cargandoRubroD();
      default:
        return false;
    }
  }

  private mensajeCargaRubroPorCodigo(codigo: string): string {
    switch (codigo) {
      case 'B':
        return 'Cargando antigüedad registrada…';
      case 'C':
        return 'Cargando grados registrados…';
      case 'D':
        return 'Cargando estudios AMAG registrados…';
      default:
        return 'Cargando…';
    }
  }

  private cargarRubroB(fichaId: string): void {
    this.cargandoRubroB.set(true);

    this.obtenerRubroAntiguedad
      .ejecutar(fichaId)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoRubroB.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo cargar el rubro B', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        this.rubroBCargadoParaFichaId = fichaId;
        this.rubroAntiguedadLocal.set(resultado.rubro);
        this.puntajeAntiguedad.set(resultado.rubro.titularidad.puntaje);
        this.rubroAntiguedadCargado.emit(resultado.rubro);
      });
  }

  private cargarRubroC(fichaId: string): void {
    this.cargandoRubroC.set(true);

    this.obtenerRubroGradosTitulos
      .ejecutar(fichaId)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoRubroC.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo cargar el rubro C', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        this.rubroCCargadoParaFichaId = fichaId;
        this.rubroGradosTitulosLocal.set(resultado.rubro);
        this.puntajeGradosTitulos.set(resultado.rubro.puntajeTotal);
        this.rubroGradosTitulosCargado.emit(resultado.rubro);
      });
  }

  private cargarRubroD(fichaId: string): void {
    this.cargandoRubroD.set(true);

    this.obtenerRubroAmag
      .ejecutar(fichaId)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoRubroD.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo cargar el rubro D', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        this.rubroDCargadoParaFichaId = fichaId;
        this.rubroAmagLocal.set(resultado.rubro);
        this.puntajeAmag.set(resultado.rubro.puntajeTotal);
        this.rubroAmagCargado.emit(resultado.rubro);
      });
  }
}
