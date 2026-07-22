import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RubrosMaestroStore } from '../../../../../../infrastructure/stores/rubros-maestro.store';
import { formatearPuntaje } from '../rubros.util';

@Component({
  selector: 'app-rubro-subrubros-panel',
  standalone: true,
  imports: [MatExpansionModule, MatProgressSpinnerModule],
  templateUrl: './rubro-subrubros-panel.html',
  styleUrl: './rubro-subrubros-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroSubrubrosPanel {
  private readonly rubrosMaestroStore = inject(RubrosMaestroStore);

  readonly idRubro = input.required<number>();
  readonly soloLectura = input(false);

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
}
