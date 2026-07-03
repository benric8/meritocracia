import { PERFILES } from '../../../domain/commons/auth-mappers';
import {
  ACCESOS_RAPIDOS_ADMIN,
  ACCESOS_RAPIDOS_REGISTRADOR,
  accesosRapidosPorPerfil,
  configInicioPorPerfil,
  textoBienvenidaPorPerfil,
  tituloAccesosRapidos,
} from './inicio-perfil.config';

describe('inicio-perfil.config', () => {
  it('define configuración para cada perfil conocido', () => {
    expect(configInicioPorPerfil(PERFILES.ADMIN)).toBeTruthy();
    expect(configInicioPorPerfil(PERFILES.REGISTRADOR)).toBeTruthy();
    expect(configInicioPorPerfil(null)).toBeNull();
  });

  it('asigna accesos rápidos distintos por perfil', () => {
    expect(accesosRapidosPorPerfil(PERFILES.ADMIN)).toEqual(ACCESOS_RAPIDOS_ADMIN);
    expect(accesosRapidosPorPerfil(PERFILES.REGISTRADOR)).toEqual(ACCESOS_RAPIDOS_REGISTRADOR);
  });

  it('admin tiene gestión de usuarios; registrador no', () => {
    const rutasAdmin = accesosRapidosPorPerfil(PERFILES.ADMIN).map((a) => a.ruta);
    const rutasReg = accesosRapidosPorPerfil(PERFILES.REGISTRADOR).map((a) => a.ruta);

    expect(rutasAdmin).toContain('/usuarios');
    expect(rutasReg).not.toContain('/usuarios');
    expect(rutasReg).toContain('/carpeta-meritos/nuevo');
    expect(rutasReg).toContain('/carpeta-meritos/consulta');
  });

  it('define textos distintos de bienvenida y título de accesos', () => {
    expect(textoBienvenidaPorPerfil(PERFILES.ADMIN)).toContain('centraliza');
    expect(textoBienvenidaPorPerfil(PERFILES.REGISTRADOR)).toContain('fichas');
    expect(tituloAccesosRapidos(PERFILES.ADMIN)).toBe('Accesos administrativos');
    expect(tituloAccesosRapidos(PERFILES.REGISTRADOR)).toBe('Mis tareas frecuentes');
  });

  it('habilita gestión de documentos solo para administrador', () => {
    expect(configInicioPorPerfil(PERFILES.ADMIN)?.mostrarEstadisticas).toBe(false);
    expect(configInicioPorPerfil(PERFILES.ADMIN)?.puedeGestionarResoluciones).toBe(true);
    expect(configInicioPorPerfil(PERFILES.REGISTRADOR)?.mostrarEstadisticas).toBe(false);
    expect(configInicioPorPerfil(PERFILES.REGISTRADOR)?.puedeGestionarResoluciones).toBe(false);
  });
});
