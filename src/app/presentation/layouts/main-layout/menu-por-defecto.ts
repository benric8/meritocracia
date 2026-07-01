import { PerfilUsuario, esPerfilAdministrador } from '../../../domain/commons/auth-mappers';
import { MenuItem } from './menu.model';

/**
 * Menú lateral de respaldo cuando el backend no devolvió opciones (RF003).
 * Diferencia explícitamente Administrador vs Usuario Registrador.
 */
export function construirMenuPorDefecto(perfil: PerfilUsuario): MenuItem[] {
  const items: MenuItem[] = [
    { id: 'inicio', label: 'Inicio', icon: 'home', url: '/inicio', children: [] },
  ];

  if (esPerfilAdministrador(perfil)) {
    items.push({
      id: 'usuarios',
      label: 'Gestión de Usuarios',
      icon: 'people',
      url: '/usuarios',
      children: [],
    });
    items.push({
      id: 'carpeta-meritos',
      label: 'Gestión de la Carpeta Personal de Méritos',
      icon: 'folder_shared',
      url: '/carpeta-meritos/asignacion',
      children: [],
    });
  } else {
    items.push({
      id: 'carpeta-meritos',
      label: 'Gestión de la Carpeta Personal de Méritos',
      icon: 'folder_shared',
      url: null,
      children: [
        {
          id: 'meritos-nuevo',
          label: 'Nuevo Registro',
          icon: 'add_circle',
          url: '/carpeta-meritos/nuevo',
          children: [],
        },
        {
          id: 'meritos-consulta',
          label: 'Consulta',
          icon: 'search',
          url: '/carpeta-meritos/consulta',
          children: [],
        },
      ],
    });
  }

  items.push({
    id: 'reportes',
    label: 'Reportes',
    icon: 'bar_chart',
    url: '/reportes',
    children: [],
  });

  return items;
}
