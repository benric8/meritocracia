import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import { RubroEstudiosPosgrado } from '../../../../../../domain/models/rubro-estudios-posgrado.model';
import { RubrosMaestroStore } from '../../../../../../infrastructure/stores/rubros-maestro.store';
import { formatearPuntaje } from '../rubros.util';
import { RubroEstudiosPosgradoComponent } from '../rubro-estudios-posgrado/rubro-estudios-posgrado';

@Component({
  selector: 'app-rubro-subrubros-panel',
  standalone: true,
  imports: [MatExpansionModule, MatProgressSpinnerModule, RubroEstudiosPosgradoComponent],
  templateUrl: './rubro-subrubros-panel.html',
  styleUrl: './rubro-subrubros-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroSubrubrosPanel {
  private readonly rubrosMaestroStore = inject(RubrosMaestroStore);

  readonly idRubro = input.required<number>();
  readonly codigoRubro = input('');
  readonly fichaId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroEstudiosPosgrado = input<RubroEstudiosPosgrado | null>(null);
  readonly cargandoEstudiosPosgrado = input(false);
  readonly puntajeEstudiosPosgrado = input(0);

  readonly puntajeEstudiosPosgradoChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly subrubros = computed(() =>
    this.rubrosMaestroStore.subrubrosDe(this.idRubro())
  );
  protected readonly cargando = computed(() =>
    this.rubrosMaestroStore.cargandoSubrubros(this.idRubro())
  );
  protected readonly error = computed(() =>
    this.rubrosMaestroStore.errorSubrubros(this.idRubro())
  );
  protected readonly formatearPuntaje = formatearPuntaje;

  protected esEstudiosPosgrado(codigo: string): boolean {
    return this.codigoRubro() === 'E' && codigo.trim().toUpperCase() === 'E1';
  }

  protected puntajeSubrubro(codigo: string): number {
    return this.esEstudiosPosgrado(codigo) ? this.puntajeEstudiosPosgrado() : 0;
  }
}
