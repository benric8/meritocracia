import { constantes } from '../../../domain/commons/constants';
import { MenuOpcion } from '../../../domain/dto/remote/OpcionesResponse.dto';

/** Modelo de presentación del menú lateral (árbol). */
export interface MenuItem {
  id: number | string;
  label: string;
  icon: string;
  /** Ruta de navegación; null cuando es un nodo padre (agrupador). */
  url: string | null;
  children: MenuItem[];
}

/** Menú mínimo cuando no hay opciones del backend (sesión degradada o en recuperación). */
export const MENU_MINIMO: MenuItem[] = [
  { id: 'inicio', label: 'Inicio', icon: 'home', url: '/inicio', children: [] },
];

/** Normaliza la url del backend: '#' o vacío => nodo padre (sin ruta). */
function normalizarUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === '' || url.trim() === '#') {
    return null;
  }
  return url.trim();
}

/**
 * Construye el árbol del menú a partir de la lista plana que envía el backend
 * (`MenuOpcion[]`), enlazando hijos con su padre vía `idOpcionSuperior`.
 * Filtra las opciones inactivas (activo === 'N').
 */
export function construirArbolMenu(opciones: MenuOpcion[] | null | undefined): MenuItem[] {
  const visibles = (opciones ?? []).filter((o) => o.activo !== constantes.INDICADOR_NO);

  const nodos = new Map<number, MenuItem>();
  visibles.forEach((o) =>
    nodos.set(o.id, {
      id: o.id,
      label: o.nombre,
      icon: o.icono || 'chevron_right',
      url: normalizarUrl(o.url),
      children: [],
    })
  );

  const raiz: MenuItem[] = [];
  visibles.forEach((o) => {
    const nodo = nodos.get(o.id)!;
    const padre = o.idOpcionSuperior != null ? nodos.get(o.idOpcionSuperior) : undefined;
    if (padre) {
      padre.children.push(nodo);
    } else {
      raiz.push(nodo);
    }
  });

  return raiz;
}
