/**
 * Ítem genérico de catálogo maestro (selects de la ficha de valoración).
 */
export interface CatalogoItem {
  id: string;
  nombre: string;
  /** Vincula el ítem a un nivel titular (p. ej. cargos filtrados por nivel). */
  nivelId?: string;
}
