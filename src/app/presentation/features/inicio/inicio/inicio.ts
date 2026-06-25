import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { AuthStore } from '../../../../infrastructure/security/stores/auth.store';

interface AccesoRapido {
  icono: string;
  titulo: string;
  descripcion: string;
  ruta: string;
}

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

  protected readonly esAdmin = computed(() => this.authStore.perfil() === 'Administrador');

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

  protected readonly accesosAdmin = signal<AccesoRapido[]>([
    {
      icono: 'group',
      titulo: 'Gestión de usuarios',
      descripcion: 'Registrar, habilitar y restablecer contraseñas.',
      ruta: '/usuarios',
    },
    {
      icono: 'folder_shared',
      titulo: 'Asignación de registradores',
      descripcion: 'Vincular registradores y suplentes a magistrados.',
      ruta: '/carpeta-meritos/asignacion',
    },
    {
      icono: 'bar_chart',
      titulo: 'Reportes y anexos',
      descripcion: 'Gráficos, cuadros y exportación PDF/Excel.',
      ruta: '/reportes',
    },
  ]);

  protected readonly accesosRegistrador = signal<AccesoRapido[]>([
    {
      icono: 'note_add',
      titulo: 'Nuevo registro',
      descripcion: 'Ficha de valoración de méritos.',
      ruta: '/carpeta-meritos/nuevo',
    },
    {
      icono: 'search',
      titulo: 'Consulta',
      descripcion: 'Buscar por DNI, apellidos o nombres y editar fichas.',
      ruta: '/carpeta-meritos/consulta',
    },
  ]);
}
