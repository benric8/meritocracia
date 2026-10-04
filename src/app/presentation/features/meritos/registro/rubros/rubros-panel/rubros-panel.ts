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
import { ObtenerRubroIdiomaFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-idioma-ficha.use-case';
import { ObtenerRubroPublicacionJuridicaFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-publicacion-juridica-ficha.use-case';
import { ObtenerRubroDistincionFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-distincion-ficha.use-case';
import { ObtenerRubroDocenciaFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-docencia-ficha.use-case';
import { ObtenerRubroDemeritoFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-demerito-ficha.use-case';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import { RubroAntiguedad } from '../../../../../../domain/models/rubro-antiguedad.model';
import { RubroAmag } from '../../../../../../domain/models/rubro-amag.model';
import { RubroIdioma } from '../../../../../../domain/models/rubro-idioma.model';
import { RubroPublicacionJuridica } from '../../../../../../domain/models/rubro-publicacion-juridica.model';
import { RubroDistincion } from '../../../../../../domain/models/rubro-distincion.model';
import { RubroDocencia } from '../../../../../../domain/models/rubro-docencia.model';
import { RubroDemerito } from '../../../../../../domain/models/rubro-demerito.model';
import { RubroGradosTitulos } from '../../../../../../domain/models/rubro-grados-titulos.model';
import { RubroMaestro } from '../../../../../../domain/models/rubro-maestro.model';
import { RubrosMaestroStore } from '../../../../../../infrastructure/stores/rubros-maestro.store';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { formatearPuntaje } from '../rubros.util';
import { RubroAmagComponent } from '../rubro-amag/rubro-amag';
import { RubroIdiomaComponent } from '../rubro-idioma/rubro-idioma';
import { RubroPublicacionJuridicaComponent } from '../rubro-publicacion-juridica/rubro-publicacion-juridica';
import { RubroDistincionComponent } from '../rubro-distincion/rubro-distincion';
import { RubroDocenciaComponent } from '../rubro-docencia/rubro-docencia';
import { RubroDemeritoComponent } from '../rubro-demerito/rubro-demerito';
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
  private readonly obtenerRubroAntiguedad = inject(ObtenerRubroAntiguedadFichaUseCase);
  private readonly obtenerRubroGradosTitulos = inject(ObtenerRubroGradosTitulosFichaUseCase);
  private readonly obtenerRubroAmag = inject(ObtenerRubroAmagFichaUseCase);
  private readonly obtenerRubroIdioma = inject(ObtenerRubroIdiomaFichaUseCase);
  private readonly obtenerRubroPublicacionJuridica = inject(ObtenerRubroPublicacionJuridicaFichaUseCase);
  private readonly obtenerRubroDistincion = inject(ObtenerRubroDistincionFichaUseCase);
  private readonly obtenerRubroDocencia = inject(ObtenerRubroDocenciaFichaUseCase);
  private readonly obtenerRubroDemerito = inject(ObtenerRubroDemeritoFichaUseCase);
  private readonly rubrosMaestroStore = inject(RubrosMaestroStore);

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
  readonly rubrosMaestro = input<RubroMaestro[]>([]);

  readonly fichaActualizada = output<FichaValoracion>();
  readonly rubroAntiguedadCargado = output<RubroAntiguedad>();
  readonly rubroGradosTitulosCargado = output<RubroGradosTitulos>();
  readonly rubroAmagCargado = output<RubroAmag>();
  readonly rubroIdiomaCargado = output<RubroIdioma>();
  readonly rubroPublicacionJuridicaCargado = output<RubroPublicacionJuridica>();
  readonly rubroDistincionCargado = output<RubroDistincion>();
  readonly rubroDocenciaCargado = output<RubroDocencia>();
  readonly rubroDemeritoCargado = output<RubroDemerito>();

  protected readonly puntajeProduccion = 0;
  protected readonly puntajeAntiguedad = signal(0);
  protected readonly puntajeGradosTitulos = signal(0);
  protected readonly puntajeAmag = signal(0);
  protected readonly puntajeIdioma = signal(0);
  protected readonly puntajePublicacionJuridica = signal(0);
  protected readonly puntajeDistincion = signal(0);
  protected readonly puntajeDocencia = signal(0);
  protected readonly puntajeDemerito = signal(0);
  protected readonly rubroAntiguedadLocal = signal<RubroAntiguedad | null>(null);
  protected readonly rubroGradosTitulosLocal = signal<RubroGradosTitulos | null>(null);
  protected readonly rubroAmagLocal = signal<RubroAmag | null>(null);
  protected readonly rubroIdiomaLocal = signal<RubroIdioma | null>(null);
  protected readonly rubroPublicacionJuridicaLocal = signal<RubroPublicacionJuridica | null>(null);
  protected readonly rubroDistincionLocal = signal<RubroDistincion | null>(null);
  protected readonly rubroDocenciaLocal = signal<RubroDocencia | null>(null);
  protected readonly rubroDemeritoLocal = signal<RubroDemerito | null>(null);
  protected readonly cargandoRubroB = signal(false);
  protected readonly cargandoRubroC = signal(false);
  protected readonly cargandoRubroD = signal(false);
  protected readonly cargandoRubroF = signal(false);
  protected readonly cargandoRubroG = signal(false);
  protected readonly cargandoRubroH = signal(false);
  protected readonly cargandoRubroI = signal(false);
  protected readonly cargandoRubroJ = signal(false);
  protected readonly formatearPuntaje = formatearPuntaje;

  private rubroBCargadoParaFichaId: string | null = null;
  private rubroCCargadoParaFichaId: string | null = null;
  private rubroDCargadoParaFichaId: string | null = null;
  private rubroFCargadoParaFichaId: string | null = null;
  private rubroGCargadoParaFichaId: string | null = null;
  private rubroHCargadoParaFichaId: string | null = null;
  private rubroICargadoParaFichaId: string | null = null;
  private rubroJCargadoParaFichaId: string | null = null;

  constructor() {
    effect(() => {
      const fichaId = this.fichaId();
      const inicialB = this.rubroAntiguedad();
      const inicialC = this.rubroGradosTitulos();
      const inicialD = this.rubroAmag();
      const inicialF = this.rubroIdioma();
      const inicialG = this.rubroPublicacionJuridica();
      const inicialH = this.rubroDistincion();
      const inicialI = this.rubroDocencia();
      const inicialJ = this.rubroDemerito();

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

      if (!fichaId || fichaId !== this.rubroFCargadoParaFichaId) {
        this.rubroFCargadoParaFichaId = null;
        this.rubroIdiomaLocal.set(inicialF);
        this.puntajeIdioma.set(inicialF?.puntajeTotal ?? 0);
      }

      if (!fichaId || fichaId !== this.rubroGCargadoParaFichaId) {
        this.rubroGCargadoParaFichaId = null;
        this.rubroPublicacionJuridicaLocal.set(inicialG);
        this.puntajePublicacionJuridica.set(inicialG?.puntajeTotal ?? 0);
      }

      if (!fichaId || fichaId !== this.rubroHCargadoParaFichaId) {
        this.rubroHCargadoParaFichaId = null;
        this.rubroDistincionLocal.set(inicialH);
        this.puntajeDistincion.set(inicialH?.puntajeTotal ?? 0);
      }

      if (!fichaId || fichaId !== this.rubroICargadoParaFichaId) {
        this.rubroICargadoParaFichaId = null;
        this.rubroDocenciaLocal.set(inicialI);
        this.puntajeDocencia.set(inicialI?.puntajeTotal ?? 0);
      }

      if (!fichaId || fichaId !== this.rubroJCargadoParaFichaId) {
        this.rubroJCargadoParaFichaId = null;
        this.rubroDemeritoLocal.set(inicialJ);
        this.puntajeDemerito.set(inicialJ?.puntajeTotal ?? 0);
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

  protected onRubroFAbierto(): void {
    const fichaId = this.fichaId();
    if (!fichaId || this.rubroFCargadoParaFichaId === fichaId || this.cargandoRubroF()) {
      return;
    }

    this.cargarRubroF(fichaId);
  }

  protected onRubroGAbierto(): void {
    const fichaId = this.fichaId();
    if (!fichaId || this.rubroGCargadoParaFichaId === fichaId || this.cargandoRubroG()) {
      return;
    }

    this.cargarRubroG(fichaId);
  }

  protected onRubroHAbierto(): void {
    const fichaId = this.fichaId();
    if (!fichaId || this.rubroHCargadoParaFichaId === fichaId || this.cargandoRubroH()) {
      return;
    }

    this.cargarRubroH(fichaId);
  }

  protected onRubroIAbierto(): void {
    const fichaId = this.fichaId();
    if (!fichaId || this.rubroICargadoParaFichaId === fichaId || this.cargandoRubroI()) {
      return;
    }

    this.cargarRubroI(fichaId);
  }

  protected onRubroJAbierto(): void {
    const fichaId = this.fichaId();
    if (!fichaId || this.rubroJCargadoParaFichaId === fichaId || this.cargandoRubroJ()) {
      return;
    }

    this.cargarRubroJ(fichaId);
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

  protected onPuntajeIdioma(puntaje: number): void {
    this.puntajeIdioma.set(puntaje);
  }

  protected onPuntajePublicacionJuridica(puntaje: number): void {
    this.puntajePublicacionJuridica.set(puntaje);
  }

  protected onPuntajeDistincion(puntaje: number): void {
    this.puntajeDistincion.set(puntaje);
  }

  protected onPuntajeDocencia(puntaje: number): void {
    this.puntajeDocencia.set(puntaje);
  }

  protected onPuntajeDemerito(puntaje: number): void {
    this.puntajeDemerito.set(puntaje);
  }

  protected onFichaActualizada(ficha: FichaValoracion): void {
    this.puntajeAntiguedad.set(ficha.rubroAntiguedad?.titularidad.puntaje ?? 0);
    this.puntajeGradosTitulos.set(ficha.rubroGradosTitulos?.puntajeTotal ?? 0);
    this.puntajeAmag.set(ficha.rubroAmag?.puntajeTotal ?? 0);
    this.puntajeIdioma.set(ficha.rubroIdioma?.puntajeTotal ?? 0);
    this.puntajePublicacionJuridica.set(ficha.rubroPublicacionJuridica?.puntajeTotal ?? 0);
    this.puntajeDistincion.set(ficha.rubroDistincion?.puntajeTotal ?? 0);
    this.puntajeDocencia.set(ficha.rubroDocencia?.puntajeTotal ?? 0);
    this.puntajeDemerito.set(ficha.rubroDemerito?.puntajeTotal ?? 0);
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
      case 'F':
        this.onRubroFAbierto();
        break;
      case 'G':
        this.onRubroGAbierto();
        break;
      case 'H':
        this.onRubroHAbierto();
        break;
      case 'I':
        this.onRubroIAbierto();
        break;
      case 'J':
        this.onRubroJAbierto();
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
      case 'F':
        return this.puntajeIdioma();
      case 'G':
        return this.puntajePublicacionJuridica();
      case 'H':
        return this.puntajeDistincion();
      case 'I':
        return this.puntajeDocencia();
      case 'J':
        return this.puntajeDemerito();
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
      case 'F':
        return this.cargandoRubroF();
      case 'G':
        return this.cargandoRubroG();
      case 'H':
        return this.cargandoRubroH();
      case 'I':
        return this.cargandoRubroI();
      case 'J':
        return this.cargandoRubroJ();
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
      case 'F':
        return 'Cargando estudios de idioma registrados…';
      case 'G':
        return 'Cargando publicaciones jurídicas registradas…';
      case 'H':
        return 'Cargando distinciones registradas…';
      case 'I':
        return 'Cargando docencia registrada…';
      case 'J':
        return 'Cargando deméritos registrados…';
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

  private cargarRubroF(fichaId: string): void {
    this.cargandoRubroF.set(true);

    this.obtenerRubroIdioma
      .ejecutar(fichaId)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoRubroF.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo cargar el rubro F', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        this.rubroFCargadoParaFichaId = fichaId;
        this.rubroIdiomaLocal.set(resultado.rubro);
        this.puntajeIdioma.set(resultado.rubro.puntajeTotal);
        this.rubroIdiomaCargado.emit(resultado.rubro);
      });
  }

  private cargarRubroG(fichaId: string): void {
    this.cargandoRubroG.set(true);

    this.obtenerRubroPublicacionJuridica
      .ejecutar(fichaId)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoRubroG.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo cargar el rubro G', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        this.rubroGCargadoParaFichaId = fichaId;
        this.rubroPublicacionJuridicaLocal.set(resultado.rubro);
        this.puntajePublicacionJuridica.set(resultado.rubro.puntajeTotal);
        this.rubroPublicacionJuridicaCargado.emit(resultado.rubro);
      });
  }

  private cargarRubroH(fichaId: string): void {
    this.cargandoRubroH.set(true);

    this.obtenerRubroDistincion
      .ejecutar(fichaId)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoRubroH.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo cargar el rubro H', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        this.rubroHCargadoParaFichaId = fichaId;
        this.rubroDistincionLocal.set(resultado.rubro);
        this.puntajeDistincion.set(resultado.rubro.puntajeTotal);
        this.rubroDistincionCargado.emit(resultado.rubro);
      });
  }

  private cargarRubroI(fichaId: string): void {
    this.cargandoRubroI.set(true);

    this.obtenerRubroDocencia
      .ejecutar(fichaId)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoRubroI.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo cargar el rubro I', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        this.rubroICargadoParaFichaId = fichaId;
        this.rubroDocenciaLocal.set(resultado.rubro);
        this.puntajeDocencia.set(resultado.rubro.puntajeTotal);
        this.rubroDocenciaCargado.emit(resultado.rubro);
      });
  }

  private cargarRubroJ(fichaId: string): void {
    this.cargandoRubroJ.set(true);

    this.obtenerRubroDemerito
      .ejecutar(fichaId)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoRubroJ.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo cargar el rubro J', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        this.rubroJCargadoParaFichaId = fichaId;
        this.rubroDemeritoLocal.set(resultado.rubro);
        this.puntajeDemerito.set(resultado.rubro.puntajeTotal);
        this.rubroDemeritoCargado.emit(resultado.rubro);
      });
  }
}
