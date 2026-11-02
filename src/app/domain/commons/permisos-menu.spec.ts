import { MenuOpcion } from '../../infrastructure/dto/remote/OpcionesResponse.dto';
import { existeOpcionPorRuta, normalizarRutaMenu } from './permisos-menu';

const opcion = (url: string) => ({ url }) as MenuOpcion;

describe('permisos-menu', () => {
  it('normaliza barra inicial y final, query, fragmento y mayúsculas', () => {
    expect(normalizarRutaMenu(' reportes/Carpeta-Personal-Meritos/ ')).toBe(
      '/reportes/carpeta-personal-meritos'
    );
    expect(normalizarRutaMenu('/reportes/carpeta-personal-meritos?ficha=40')).toBe(
      '/reportes/carpeta-personal-meritos'
    );
    expect(normalizarRutaMenu('#')).toBe('');
    expect(normalizarRutaMenu(null)).toBe('');
  });

  it('autoriza la ruta aunque la url del menú difiera solo en formato', () => {
    const opciones = [opcion('/reportes/carpeta-personal-meritos/')];

    expect(existeOpcionPorRuta('/reportes/carpeta-personal-meritos', opciones)).toBe(true);
    expect(existeOpcionPorRuta('/reportes/ficha-valoracion-meritos', opciones)).toBe(false);
  });
});
