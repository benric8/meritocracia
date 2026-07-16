import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
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

  protected readonly puntajeProduccion = 0;
  protected readonly puntajeAntiguedad = signal(0);
  protected readonly formatearPuntaje = formatearPuntaje;

  protected onPuntajeAntiguedad(puntaje: number): void {
    this.puntajeAntiguedad.set(puntaje);
  }
}
