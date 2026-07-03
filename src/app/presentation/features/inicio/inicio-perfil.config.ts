import { PERFILES, PerfilUsuario, PerfilUsuarioConocido } from '../../../domain/commons/auth-mappers';

export interface AccesoRapidoInicio {
  icono: string;
  titulo: string;
  descripcion: string;
  ruta: string;
}

export interface ConfigInicioPerfil {
  textoBienvenida: string;
  tituloAccesosRapidos: string;
  accesosRapidos: AccesoRapidoInicio[];
  mostrarEstadisticas: boolean;
  puedeGestionarResoluciones: boolean;
}

export const ACCESOS_RAPIDOS_ADMIN: AccesoRapidoInicio[] = [
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
];

export const ACCESOS_RAPIDOS_REGISTRADOR: AccesoRapidoInicio[] = [
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
];

/**
 * Configuración de inicio por perfil.
 * Para escalar: añadir una entrada con la clave del nuevo perfil en PERFILES.
 */
export const CONFIG_INICIO_POR_PERFIL: Record<PerfilUsuarioConocido, ConfigInicioPerfil> = {
  [PERFILES.ADMIN]: {
    textoBienvenida:
      'Plataforma institucional del Poder Judicial del Perú que centraliza y valora los méritos de Jueces Superiores Titulares y Supremos — Equipo Cuadro de Méritos y Antigüedad.',
    tituloAccesosRapidos: 'Accesos administrativos',
    accesosRapidos: ACCESOS_RAPIDOS_ADMIN,
    mostrarEstadisticas: false,
    puedeGestionarResoluciones: true,
  },
  [PERFILES.REGISTRADOR]: {
    textoBienvenida:
      'Registro y actualización de fichas de valoración de magistrados asignados, conforme a la normativa vigente y lineamientos del área usuaria.',
    tituloAccesosRapidos: 'Mis tareas frecuentes',
    accesosRapidos: ACCESOS_RAPIDOS_REGISTRADOR,
    mostrarEstadisticas: false,
    puedeGestionarResoluciones: false,
  },
};

export function configInicioPorPerfil(perfil: PerfilUsuario): ConfigInicioPerfil | null {
  if (!perfil) {
    return null;
  }
  return CONFIG_INICIO_POR_PERFIL[perfil] ?? null;
}

export function textoBienvenidaPorPerfil(perfil: PerfilUsuario): string {
  return configInicioPorPerfil(perfil)?.textoBienvenida ?? '';
}

export function accesosRapidosPorPerfil(perfil: PerfilUsuario): AccesoRapidoInicio[] {
  return configInicioPorPerfil(perfil)?.accesosRapidos ?? [];
}

export function tituloAccesosRapidos(perfil: PerfilUsuario): string {
  return configInicioPorPerfil(perfil)?.tituloAccesosRapidos ?? 'Accesos rápidos';
}
