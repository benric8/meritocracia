import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import { RubroEstudiosPosgrado } from '../../../../../../domain/models/rubro-estudios-posgrado.model';
import { RubroPasantias } from '../../../../../../domain/models/rubro-pasantias.model';
import { RubroCursosEspecializacion } from '../../../../../../domain/models/rubro-cursos-especializacion.model';
import { RubroCertamenesAcademicos } from '../../../../../../domain/models/rubro-certamenes-academicos.model';
import { RubroAsistenciasEventos } from '../../../../../../domain/models/rubro-asistencias-eventos.model';
import { RubroOfimatica } from '../../../../../../domain/models/rubro-ofimatica.model';
import { RubrosMaestroStore } from '../../../../../../infrastructure/stores/rubros-maestro.store';
import { formatearPuntaje } from '../rubros.util';
import { RubroEstudiosPosgradoComponent } from '../rubro-estudios-posgrado/rubro-estudios-posgrado';
import { RubroPasantiasComponent } from '../rubro-pasantias/rubro-pasantias';
import { RubroCursosEspecializacionComponent } from '../rubro-cursos-especializacion/rubro-cursos-especializacion';
import { RubroCertamenesAcademicosComponent } from '../rubro-certamenes-academicos/rubro-certamenes-academicos';
import { RubroAsistenciasEventosComponent } from '../rubro-asistencias-eventos/rubro-asistencias-eventos';
import { RubroOfimaticaComponent } from '../rubro-ofimatica/rubro-ofimatica';

@Component({
  selector: 'app-rubro-subrubros-panel',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatProgressSpinnerModule,
    RubroEstudiosPosgradoComponent,
    RubroPasantiasComponent,
    RubroCursosEspecializacionComponent,
    RubroCertamenesAcademicosComponent,
    RubroAsistenciasEventosComponent,
    RubroOfimaticaComponent,
  ],
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
  readonly rubroPasantias = input<RubroPasantias | null>(null);
  readonly cargandoPasantias = input(false);
  readonly puntajePasantias = input(0);
  readonly rubroCursosEspecializacion = input<RubroCursosEspecializacion | null>(null);
  readonly cargandoCursosEspecializacion = input(false);
  readonly puntajeCursosEspecializacion = input(0);
  readonly rubroCertamenesAcademicos = input<RubroCertamenesAcademicos | null>(null);
  readonly cargandoCertamenesAcademicos = input(false);
  readonly puntajeCertamenesAcademicos = input(0);
  readonly rubroAsistenciasEventos = input<RubroAsistenciasEventos | null>(null);
  readonly cargandoAsistenciasEventos = input(false);
  readonly puntajeAsistenciasEventos = input(0);
  readonly rubroOfimatica = input<RubroOfimatica | null>(null);
  readonly cargandoOfimatica = input(false);
  readonly puntajeOfimatica = input(0);

  readonly puntajeEstudiosPosgradoChange = output<number>();
  readonly puntajePasantiasChange = output<number>();
  readonly puntajeCursosEspecializacionChange = output<number>();
  readonly puntajeCertamenesAcademicosChange = output<number>();
  readonly puntajeAsistenciasEventosChange = output<number>();
  readonly puntajeOfimaticaChange = output<number>();
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
    return this.codigoRubro() === 'E' && this.codigoNormalizado(codigo) === 'E1';
  }

  protected esPasantias(codigo: string): boolean {
    return this.codigoRubro() === 'E' && this.codigoNormalizado(codigo) === 'E2';
  }

  protected esCursosEspecializacion(codigo: string): boolean {
    return this.codigoRubro() === 'E' && this.codigoNormalizado(codigo) === 'E3';
  }

  protected esCertamenesAcademicos(codigo: string): boolean {
    return this.codigoRubro() === 'E' && this.codigoNormalizado(codigo) === 'E4';
  }

  protected esAsistenciasEventos(codigo: string): boolean {
    return this.codigoRubro() === 'E' && this.codigoNormalizado(codigo) === 'E5';
  }

  protected esOfimatica(codigo: string): boolean {
    return this.codigoRubro() === 'E' && this.codigoNormalizado(codigo) === 'E6';
  }

  protected puntajeSubrubro(codigo: string): number {
    if (this.esEstudiosPosgrado(codigo)) {
      return this.puntajeEstudiosPosgrado();
    }
    if (this.esPasantias(codigo)) {
      return this.puntajePasantias();
    }
    if (this.esCursosEspecializacion(codigo)) {
      return this.puntajeCursosEspecializacion();
    }
    if (this.esCertamenesAcademicos(codigo)) {
      return this.puntajeCertamenesAcademicos();
    }
    if (this.esAsistenciasEventos(codigo)) {
      return this.puntajeAsistenciasEventos();
    }
    if (this.esOfimatica(codigo)) {
      return this.puntajeOfimatica();
    }
    return 0;
  }

  protected formatearPuntajeSubrubro(codigo: string): string {
    const puntaje = this.puntajeSubrubro(codigo);
    if (
      this.esPasantias(codigo) ||
      this.esCursosEspecializacion(codigo) ||
      this.esCertamenesAcademicos(codigo) ||
      this.esAsistenciasEventos(codigo) ||
      this.esOfimatica(codigo)
    ) {
      return Number.isFinite(puntaje) ? puntaje.toFixed(3) : '0.000';
    }
    return this.formatearPuntaje(puntaje);
  }

  private codigoNormalizado(codigo: string): string {
    return codigo.trim().toUpperCase().replace(/\./g, '');
  }
}
