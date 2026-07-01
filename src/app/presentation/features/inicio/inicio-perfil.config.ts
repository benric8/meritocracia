import { PerfilUsuario, esPerfilAdministrador } from '../../../domain/commons/auth-mappers';

export interface AccesoRapidoInicio {
  icono: string;
  titulo: string;
  descripcion: string;
  ruta: string;
}

export const TEXTO_BIENVENIDA_ADMIN =  'Plataforma institucional del Poder Judicial del Perú que centraliza y valora los méritos de Jueces Superiores Titulares y Supremos — Equipo Cuadro de Méritos y Antigüedad.';

export const TEXTO_BIENVENIDA_REGISTRADOR =
  'Registro y actualización de fichas de valoración de magistrados asignados, conforme a la normativa vigente y lineamientos del área usuaria.';

export function textoBienvenidaPorPerfil(perfil: PerfilUsuario): string {
  return esPerfilAdministrador(perfil) ? TEXTO_BIENVENIDA_ADMIN : TEXTO_BIENVENIDA_REGISTRADOR;
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

export function accesosRapidosPorPerfil(perfil: PerfilUsuario): AccesoRapidoInicio[] {
  return esPerfilAdministrador(perfil) ? ACCESOS_RAPIDOS_ADMIN : ACCESOS_RAPIDOS_REGISTRADOR;
}

export function tituloAccesosRapidos(perfil: PerfilUsuario): string {
  return esPerfilAdministrador(perfil) ? 'Accesos administrativos' : 'Mis tareas frecuentes';
}
