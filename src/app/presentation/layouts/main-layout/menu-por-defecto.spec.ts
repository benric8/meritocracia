import { construirMenuPorDefecto } from './menu-por-defecto';

describe('menu-por-defecto', () => {
  function etiquetas(menu = construirMenuPorDefecto('Administrador')): string[] {
    return menu.map((item) => item.label);
  }

  it('administrador ve gestión de usuarios y carpeta como enlace directo', () => {
    const menu = construirMenuPorDefecto('Administrador');
    const etiquetasMenu = etiquetas(menu);

    expect(etiquetasMenu).toContain('Inicio');
    expect(etiquetasMenu).toContain('Gestión de Usuarios');
    expect(etiquetasMenu).toContain('Gestión de la Carpeta Personal de Méritos');
    expect(etiquetasMenu).toContain('Reportes');

    const carpeta = menu.find((item) => item.id === 'carpeta-meritos');
    expect(carpeta?.url).toBe('/carpeta-meritos/asignacion');
    expect(carpeta?.children).toEqual([]);
  });

  it('registrador no ve gestión de usuarios y tiene submenú nuevo/consulta', () => {
    const menu = construirMenuPorDefecto('Usuario Registrador');
    const etiquetasMenu = etiquetas(menu);

    expect(etiquetasMenu).not.toContain('Gestión de Usuarios');
    expect(etiquetasMenu).toContain('Inicio');
    expect(etiquetasMenu).toContain('Reportes');

    const carpeta = menu.find((item) => item.id === 'carpeta-meritos');
    expect(carpeta?.url).toBeNull();
    expect(carpeta?.children.map((h) => h.url)).toEqual([
      '/carpeta-meritos/nuevo',
      '/carpeta-meritos/consulta',
    ]);
  });
});
