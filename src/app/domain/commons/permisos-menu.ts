import { MenuOpcion } from '../../infrastructure/dto/remote/OpcionesResponse.dto';

/**
 * Normaliza rutas del menú/backend para comparación (`/modulo/sub`): sin query ni
 * fragmento, sin `/` al final y en minúsculas. Así `x_url` = `reportes/Sub/` coincide con
 * la URL `/reportes/sub` que deja el router.
 */
export function normalizarRutaMenu(ruta: string | null | undefined): string {
  const limpia = (ruta ?? '').trim().split(/[?#]/)[0].replace(/\/+$/, '');
  if (!limpia) {
    return '';
  }
  return (limpia.startsWith('/') ? limpia : `/${limpia}`).toLowerCase();
}

/**
 * Verifica si la URL de navegación está autorizada en las opciones del backend.
 * Inspirado en `LocalStorageUsuarioService.existeOpcion` de meritocracia-web.
 */
export function existeOpcionPorRuta(ruta: string, opciones: MenuOpcion[]): boolean {
  const objetivo = normalizarRutaMenu(ruta);
  if (!objetivo) {
    return false;
  }

  return opciones.some((opcion) => normalizarRutaMenu(opcion.url) === objetivo);
}
