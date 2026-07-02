import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { AuthStore } from '../../../../infrastructure/security/stores/auth.store';
import {
  accesosRapidosPorPerfil,
  configInicioPorPerfil,
  textoBienvenidaPorPerfil,
  tituloAccesosRapidos,
} from '../inicio-perfil.config';

interface Documento {
  nombre: string;
  fecha: string;
}

interface Estadistica {
  etiqueta: string;
  valor: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatCardModule, MatButtonModule, MatRippleModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {
  private readonly authStore = inject(AuthStore);

  protected readonly configInicio = computed(() => configInicioPorPerfil(this.authStore.perfil()));
  protected readonly mostrarEstadisticas = computed(() => this.configInicio()?.mostrarEstadisticas ?? false);
  protected readonly puedeGestionarResoluciones = computed(
    () => this.configInicio()?.puedeGestionarResoluciones ?? false
  );
  protected readonly textoBienvenida = computed(() => textoBienvenidaPorPerfil(this.authStore.perfil()));
  protected readonly tituloAccesos = computed(() => tituloAccesosRapidos(this.authStore.perfil()));
  protected readonly accesosRapidos = computed(() => accesosRapidosPorPerfil(this.authStore.perfil()));

  protected readonly estadisticas = signal<Estadistica[]>([
    { etiqueta: 'Fichas activas', valor: '248' },
    { etiqueta: 'Jueces Supremos', valor: '36' },
    { etiqueta: 'Superiores Titulares', valor: '212' },
  ]);

  protected readonly documentos = signal<Documento[]>([
    {
      nombre: 'R.A. N° 031-2013-CE-PJ — Producción jurisdiccional',
      fecha: 'Actualizado 12/03/2026',
    },
    {
      nombre: 'Lineamientos de valoración 2026',
      fecha: 'Actualizado 05/04/2026',
    },
  ]);
}
