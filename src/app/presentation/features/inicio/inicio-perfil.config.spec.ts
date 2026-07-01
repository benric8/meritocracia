import {
  ACCESOS_RAPIDOS_ADMIN,
  ACCESOS_RAPIDOS_REGISTRADOR,
  accesosRapidosPorPerfil,
  textoBienvenidaPorPerfil,
  tituloAccesosRapidos,
} from './inicio-perfil.config';
import { esPerfilAdministrador } from '../../../domain/commons/auth-mappers';

describe('inicio-perfil.config', () => {
  it('identifica administrador', () => {
    expect(esPerfilAdministrador('Administrador')).toBe(true);
    expect(esPerfilAdministrador('Usuario Registrador')).toBe(false);
    expect(esPerfilAdministrador(null)).toBe(false);
  });

  it('asigna accesos rápidos distintos por perfil', () => {
    expect(accesosRapidosPorPerfil('Administrador')).toEqual(ACCESOS_RAPIDOS_ADMIN);
    expect(accesosRapidosPorPerfil('Usuario Registrador')).toEqual(ACCESOS_RAPIDOS_REGISTRADOR);
  });

  it('admin tiene gestión de usuarios; registrador no', () => {
    const rutasAdmin = accesosRapidosPorPerfil('Administrador').map((a) => a.ruta);
    const rutasReg = accesosRapidosPorPerfil('Usuario Registrador').map((a) => a.ruta);

    expect(rutasAdmin).toContain('/usuarios');
    expect(rutasReg).not.toContain('/usuarios');
    expect(rutasReg).toContain('/carpeta-meritos/nuevo');
    expect(rutasReg).toContain('/carpeta-meritos/consulta');
  });

  it('define textos distintos de bienvenida y título de accesos', () => {
    expect(textoBienvenidaPorPerfil('Administrador')).toContain('centraliza');
    expect(textoBienvenidaPorPerfil('Usuario Registrador')).toContain('fichas');
    expect(tituloAccesosRapidos('Administrador')).toBe('Accesos administrativos');
    expect(tituloAccesosRapidos('Usuario Registrador')).toBe('Mis tareas frecuentes');
  });
});
