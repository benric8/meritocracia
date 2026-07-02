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
import { construirArbolMenu, MENU_MINIMO, MenuItem } from './menu.model';

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
   * Menú lateral desde las opciones del backend (RF003).
   * Sin opciones válidas solo se muestra Inicio hasta que el usuario reingrese.
   */
  public readonly menuItems = computed<MenuItem[]>(() => {
    const opciones = this.authStore.opciones();
    if (!opciones?.length) {
      return MENU_MINIMO;
    }
    return construirArbolMenu(opciones);
  });

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
