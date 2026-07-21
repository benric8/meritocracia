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
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import { RubroAntiguedad } from '../../../../../../domain/models/rubro-antiguedad.model';
import { RubroGradosTitulos } from '../../../../../../domain/models/rubro-grados-titulos.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { formatearPuntaje } from '../rubros.util';
import { RubroGradosTitulosComponent } from '../rubro-grados-titulos/rubro-grados-titulos';
import { RubroProduccion } from '../rubro-produccion/rubro-produccion';
import { RubroAntiguedadComponent } from '../rubro-antiguedad/rubro-antiguedad';

@Component({
  selector: 'app-rubros-panel',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatProgressSpinnerModule,
    RubroProduccion,
    RubroAntiguedadComponent,
    RubroGradosTitulosComponent,
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

  readonly fechaValoracion = input<string | null>(null);
  readonly fichaId = input<string | null>(null);
  readonly nivelId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroAntiguedad = input<RubroAntiguedad | null>(null);
  readonly rubroGradosTitulos = input<RubroGradosTitulos | null>(null);

  readonly fichaActualizada = output<FichaValoracion>();
  readonly rubroAntiguedadCargado = output<RubroAntiguedad>();
  readonly rubroGradosTitulosCargado = output<RubroGradosTitulos>();

  protected readonly puntajeProduccion = 0;
  protected readonly puntajeAntiguedad = signal(0);
  protected readonly puntajeGradosTitulos = signal(0);
  protected readonly rubroAntiguedadLocal = signal<RubroAntiguedad | null>(null);
  protected readonly rubroGradosTitulosLocal = signal<RubroGradosTitulos | null>(null);
  protected readonly cargandoRubroB = signal(false);
  protected readonly cargandoRubroC = signal(false);
  protected readonly formatearPuntaje = formatearPuntaje;

  private rubroBCargadoParaFichaId: string | null = null;
  private rubroCCargadoParaFichaId: string | null = null;

  constructor() {
    effect(() => {
      const fichaId = this.fichaId();
      const inicialB = this.rubroAntiguedad();
      const inicialC = this.rubroGradosTitulos();

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

  protected onPuntajeAntiguedad(puntaje: number): void {
    this.puntajeAntiguedad.set(puntaje);
  }

  protected onPuntajeGradosTitulos(puntaje: number): void {
    this.puntajeGradosTitulos.set(puntaje);
  }

  protected onFichaActualizada(ficha: FichaValoracion): void {
    this.puntajeAntiguedad.set(ficha.rubroAntiguedad?.titularidad.puntaje ?? 0);
    this.puntajeGradosTitulos.set(ficha.rubroGradosTitulos?.puntajeTotal ?? 0);
    this.fichaActualizada.emit(ficha);
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
}
