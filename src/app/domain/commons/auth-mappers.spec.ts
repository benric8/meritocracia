import { esPerfilAdministrador, mapearPerfilUsuario } from './auth-mappers';

describe('auth-mappers', () => {
  it('mapea variantes de administrador', () => {
    expect(mapearPerfilUsuario('ADMINISTRADOR')).toBe('Administrador');
    expect(mapearPerfilUsuario('', 'Perfil Administrador')).toBe('Administrador');
    expect(mapearPerfilUsuario('ROL_01', 'Administrador del sistema')).toBe('Administrador');
  });

  it('mapea registrador cuando no es admin', () => {
    expect(mapearPerfilUsuario('REGISTRADOR')).toBe('Usuario Registrador');
    expect(mapearPerfilUsuario('', 'Usuario Registrador')).toBe('Usuario Registrador');
  });

  it('esPerfilAdministrador tolera valores crudos del backend', () => {
    expect(esPerfilAdministrador('ADMINISTRADOR')).toBe(true);
    expect(esPerfilAdministrador('Perfil Administrador')).toBe(true);
    expect(esPerfilAdministrador('Usuario Registrador')).toBe(false);
  });
});
