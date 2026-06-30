import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthStore } from '../../../infrastructure/security/stores/auth.store';
import { construirArbolMenu, MenuItem } from './menu.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatExpansionModule
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  // Inyectamos el Store Reactivo (Signals) y el Enrutador
  public authStore = inject(AuthStore);
  private router = inject(Router);

  /**
   * Menú lateral reactivo. Si el backend devolvió opciones (RF001), se arma
   * dinámicamente desde el store; si no, se usa un menú estático por perfil
   * como respaldo para no dejar la navegación vacía.
   */
  public readonly menuItems = computed<MenuItem[]>(() => {
    const opciones = this.authStore.opciones();
    if (opciones && opciones.length > 0) {
      return construirArbolMenu(opciones);
    }
    return this.menuPorDefecto();
  });

  private menuPorDefecto(): MenuItem[] {
    const items: MenuItem[] = [
      { id: 'inicio', label: 'Inicio', icon: 'home', url: '/inicio', children: [] },
    ];

    if (this.authStore.perfil() === 'Administrador') {
      items.push({ id: 'usuarios', label: 'Gestión de Usuarios', icon: 'people', url: '/usuarios', children: [] });
    }

    items.push({
      id: 'carpeta-meritos',
      label: 'Carpeta de Méritos',
      icon: 'folder_shared',
      url: null,
      children: [
        { id: 'meritos-nuevo', label: 'Nuevo Registro', icon: 'add_circle', url: '/carpeta-meritos/nuevo', children: [] },
        { id: 'meritos-consulta', label: 'Consulta', icon: 'search', url: '/carpeta-meritos/consulta', children: [] },
      ],
    });

    items.push({ id: 'reportes', label: 'Reportes', icon: 'bar_chart', url: '/reportes', children: [] });

    return items;
  }

  onCambiarPassword() {
    // Lógica para abrir modal o redirigir a cambio de contraseña (RF003)
    console.log('Navegando a cambiar contraseña...');
  }

  onCerrarSesion() {
    // RF002: El sistema deberá permitir cerrar sesión de forma segura
    this.authStore.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
