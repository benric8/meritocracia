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
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import { RubroAntiguedad } from '../../../../../../domain/models/rubro-antiguedad.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { formatearPuntaje } from '../rubros.util';
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
  ],
  templateUrl: './rubros-panel.html',
  styleUrl: './rubros-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubrosPanel {
  private readonly destroyRef = inject(DestroyRef);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly obtenerRubroAntiguedad = inject(ObtenerRubroAntiguedadFichaUseCase);

  readonly fechaValoracion = input<string | null>(null);
  readonly fichaId = input<string | null>(null);
  readonly nivelId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroAntiguedad = input<RubroAntiguedad | null>(null);

  readonly fichaActualizada = output<FichaValoracion>();
  readonly rubroAntiguedadCargado = output<RubroAntiguedad>();

  protected readonly puntajeProduccion = 0;
  protected readonly puntajeAntiguedad = signal(0);
  protected readonly rubroAntiguedadLocal = signal<RubroAntiguedad | null>(null);
  protected readonly cargandoRubroB = signal(false);
  protected readonly formatearPuntaje = formatearPuntaje;

  private rubroBCargadoParaFichaId: string | null = null;

  constructor() {
    effect(() => {
      const fichaId = this.fichaId();
      const inicial = this.rubroAntiguedad();

      if (!fichaId || fichaId !== this.rubroBCargadoParaFichaId) {
        this.rubroBCargadoParaFichaId = null;
        this.rubroAntiguedadLocal.set(inicial);
        this.puntajeAntiguedad.set(inicial?.titularidad.puntaje ?? 0);
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

  protected onPuntajeAntiguedad(puntaje: number): void {
    this.puntajeAntiguedad.set(puntaje);
  }

  protected onFichaActualizada(ficha: FichaValoracion): void {
    this.puntajeAntiguedad.set(ficha.rubroAntiguedad?.titularidad.puntaje ?? 0);
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
}
