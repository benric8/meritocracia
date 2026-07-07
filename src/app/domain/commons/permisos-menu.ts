import { MenuOpcion } from '../../infrastructure/dto/remote/OpcionesResponse.dto';

/** Normaliza rutas del menú/backend para comparación (`/modulo/sub`). */
export function normalizarRutaMenu(ruta: string | null | undefined): string {
  if (!ruta || ruta.trim() === '' || ruta.trim() === '#') {
    return '';
  }
  const sinQuery = ruta.trim().split('?')[0];
  return sinQuery.startsWith('/') ? sinQuery : `/${sinQuery}`;
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
