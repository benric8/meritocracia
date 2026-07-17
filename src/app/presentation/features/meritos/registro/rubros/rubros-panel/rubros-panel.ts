import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import { RubroAntiguedad } from '../../../../../../domain/models/rubro-antiguedad.model';
import { formatearPuntaje } from '../rubros.util';
import { RubroProduccion } from '../rubro-produccion/rubro-produccion';
import { RubroAntiguedadComponent } from '../rubro-antiguedad/rubro-antiguedad';

@Component({
  selector: 'app-rubros-panel',
  standalone: true,
  imports: [MatExpansionModule, RubroProduccion, RubroAntiguedadComponent],
  templateUrl: './rubros-panel.html',
  styleUrl: './rubros-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubrosPanel {
  readonly fechaValoracion = input<string | null>(null);
  readonly fichaId = input<string | null>(null);
  readonly nivelId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroAntiguedad = input<RubroAntiguedad | null>(null);

  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly puntajeProduccion = 0;
  protected readonly puntajeAntiguedad = signal(0);
  protected readonly formatearPuntaje = formatearPuntaje;

  protected onPuntajeAntiguedad(puntaje: number): void {
    this.puntajeAntiguedad.set(puntaje);
  }

  protected onFichaActualizada(ficha: FichaValoracion): void {
    this.puntajeAntiguedad.set(ficha.rubroAntiguedad?.titularidad.puntaje ?? 0);
    this.fichaActualizada.emit(ficha);
  }
}