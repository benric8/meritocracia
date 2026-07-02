import {
  esPerfilAdministrador,
  IDS_PERFIL,
  mapearPerfilPorId,
  mapearPerfilPorTexto,
  mapearPerfilUsuario,
  PERFILES,
  resolverPerfilUsuario,
} from './auth-mappers';

describe('auth-mappers', () => {
  it('mapea perfiles por idPerfil del backend', () => {
    expect(mapearPerfilPorId(IDS_PERFIL.ADMIN)).toBe(PERFILES.ADMIN);
    expect(mapearPerfilPorId(IDS_PERFIL.REGISTRADOR)).toBe(PERFILES.REGISTRADOR);
    expect(mapearPerfilPorId(999)).toBeNull();
    expect(mapearPerfilPorId(null)).toBeNull();
  });

  it('prioriza idPerfil sobre texto en resolverPerfilUsuario', () => {
    expect(
      resolverPerfilUsuario({
        idPerfil: IDS_PERFIL.REGISTRADOR,
        rol: 'ADMINISTRADOR',
        nombrePerfil: 'Perfil Administrador',
      })
    ).toBe(PERFILES.REGISTRADOR);
  });

  it('usa texto como respaldo cuando no hay idPerfil', () => {
    expect(
      resolverPerfilUsuario({
        rol: 'ADMINISTRADOR',
        nombrePerfil: 'Perfil Administrador',
      })
    ).toBe(PERFILES.ADMIN);

    expect(
      resolverPerfilUsuario({
        rol: 'REGISTRADOR',
        nombrePerfil: 'Usuario Registrador',
      })
    ).toBe(PERFILES.REGISTRADOR);
  });

  it('mapea variantes de administrador por texto', () => {
    expect(mapearPerfilPorTexto('ADMINISTRADOR')).toBe(PERFILES.ADMIN);
    expect(mapearPerfilPorTexto('', 'Perfil Administrador')).toBe(PERFILES.ADMIN);
    expect(mapearPerfilPorTexto('ROL_01', 'Administrador del sistema')).toBe(PERFILES.ADMIN);
  });

  it('mapea registrador por texto cuando no es admin', () => {
    expect(mapearPerfilPorTexto('REGISTRADOR')).toBe(PERFILES.REGISTRADOR);
    expect(mapearPerfilPorTexto('', 'Usuario Registrador')).toBe(PERFILES.REGISTRADOR);
  });

  it('retorna null cuando el rol no es reconocido', () => {
    expect(mapearPerfilPorTexto('ROL_DESCONOCIDO')).toBeNull();
    expect(resolverPerfilUsuario({ idPerfil: 999, rol: 'ROL_DESCONOCIDO' })).toBeNull();
  });

  it('mapearPerfilUsuario mantiene compatibilidad con respaldo por texto', () => {
    expect(mapearPerfilUsuario('REGISTRADOR')).toBe(PERFILES.REGISTRADOR);
  });

  it('esPerfilAdministrador tolera valores crudos del backend', () => {
    expect(esPerfilAdministrador('ADMINISTRADOR')).toBe(true);
    expect(esPerfilAdministrador('Perfil Administrador')).toBe(true);
    expect(esPerfilAdministrador('Usuario Registrador')).toBe(false);
  });
});
