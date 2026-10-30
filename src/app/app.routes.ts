import { Routes } from '@angular/router';
import { tokenNiveles } from './domain/commons/constants';
import { authGuard, invitadoGuard } from './infrastructure/security/guards/auth.guard';
import { rolGuard } from './infrastructure/security/guards/rol.guard';
import { tokenNivelGuard } from './infrastructure/security/guards/token-nivel.guard';
import { permisoRutaGuard } from './infrastructure/security/guards/permiso-ruta.guard';

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
    canActivate: [authGuard, tokenNivelGuard(tokenNiveles.NIVEL_OPCIONES)],
    canActivateChild: [permisoRutaGuard],
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
      // URLs alineadas con opciones del backend (`/meritos/...`).
      {
        path: 'meritos',
        children: [
          { path: '', redirectTo: 'asignacion-registrador', pathMatch: 'full' },
          {
            path: 'nuevo-registro',
            loadComponent: () =>
              import('./presentation/features/meritos/registro/registro').then((m) => m.Registro),
          },
          {
            path: 'consulta',
            loadComponent: () =>
              import('./presentation/features/meritos/consulta/consulta').then((m) => m.Consulta),
          },
          {
            path: 'asignacion-registrador',
            canActivate: [rolGuard(['Administrador'])],
            loadComponent: () =>
              import('./presentation/features/meritos/asignacion/asignacion').then((m) => m.Asignacion),
          },
          {
            path: 'fecha-valoracion',
            canActivate: [rolGuard(['Administrador'])],
            loadComponent: () =>
              import('./presentation/features/meritos/fecha/fecha').then((m) => m.Fecha),
          },
        ],
      },

      // 4. Módulo: Reportes(RF007)
      {
        path: 'reportes',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./presentation/features/reportes/reportes/reportes').then((m) => m.Reportes),
          },
          // Submenú A: Gráficos de Rubros de Valoración (dashboard estadístico).
          {
            path: 'graficos-rubros',
            canActivate: [rolGuard(['Administrador'])],
            loadComponent: () =>
              import('./presentation/features/reportes/graficos-rubros/graficos-rubros').then(
                (m) => m.GraficosRubros
              ),
          },
          // Submenú B: Cuadro de Antigüedad de Jueces Supremos Titulares (Anexo 01).
          {
            path: 'cuadro-antiguedad-supremos',
            canActivate: [rolGuard(['Administrador'])],
            loadComponent: () =>
              import(
                './presentation/features/reportes/cuadro-antiguedad-supremos/cuadro-antiguedad-supremos'
              ).then((m) => m.CuadroAntiguedadSupremos),
          },
          // Submenú C: Cuadro de Méritos de Jueces Superiores Titulares (Anexo 02).
          {
            path: 'cuadro-meritos-superiores',
            canActivate: [rolGuard(['Administrador'])],
            loadComponent: () =>
              import(
                './presentation/features/reportes/cuadro-meritos-superiores/cuadro-meritos-superiores'
              ).then((m) => m.CuadroMeritosSuperiores),
          },
          // Submenú D: Cuadro de Antigüedad de Jueces Superiores Titulares (Anexo 03).
          {
            path: 'cuadro-antiguedad-superiores',
            canActivate: [rolGuard(['Administrador'])],
            loadComponent: () =>
              import(
                './presentation/features/reportes/cuadro-antiguedad-superiores/cuadro-antiguedad-superiores'
              ).then((m) => m.CuadroAntiguedadSuperiores),
          },
        ],
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