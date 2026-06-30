import { Routes } from '@angular/router';
import { authGuard, invitadoGuard } from './infrastructure/security/guards/auth.guard';
import { rolGuard } from './infrastructure/security/guards/rol.guard';

export const routes: Routes = [
  // Redirección inicial hacia el Login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ==========================================
  // ZONA PÚBLICA (RF002: Accesos y gestión de usuario)
  // ==========================================
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./presentation/features/autenticacion/components/login/login').then(m => m.Login)
  },

  // ==========================================
  // ZONA PRIVADA (Protegida por Layout y Guards)
  // ==========================================
  {
    path: '',
    // El Layout envolverá todas las pantallas internas mostrando la cabecera y el menú (RF003)
    canActivate: [authGuard],
    loadComponent: () => import('./presentation/layouts/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      
      // 1. Módulo: Inicio (RF003 - Resoluciones y lineamientos)
      {
        path: 'inicio',
        loadComponent: () => import('./presentation/features/inicio/inicio/inicio').then(m => m.Inicio)
      },

      // 2. Módulo: Gestión de Usuarios (RF004 - Solo Administrador)
      {
        path: 'usuarios',
        canActivate: [rolGuard(['Administrador'])],
        loadComponent: () => import('./presentation/features/usuarios/usuarios/usuarios').then(m => m.Usuarios)
      },

      // 3. Módulo: Gestión de la Carpeta Personal de Méritos (RF006)
      {
        path: 'carpeta-meritos',
        children: [
          { path: '', redirectTo: 'consulta', pathMatch: 'full' },
          {
            path: 'nuevo', // Submenú: Nuevo registro
            loadComponent: () => import('./presentation/features/meritos/registro/registro').then(m => m.Registro)
          },
          {
            path: 'consulta', // Submenú: Consulta
            loadComponent: () => import('./presentation/features/meritos/consulta/consulta').then(m => m.Consulta)
          }
        ]
      },

      // 4. Módulo: Reportes (RF007)
      {
        path: 'reportes',
        loadComponent: () => import('./presentation/features/reportes/reportes/reportes').then(m => m.Reportes)
      }
    ]
  },

  // ==========================================
  // RUTA COMODÍN (Página no encontrada)
  // ==========================================
  { 
    path: '**', 
    redirectTo: 'inicio' 
  }
];