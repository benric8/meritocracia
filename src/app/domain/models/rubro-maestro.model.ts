/** Rubro de valoración según catálogo maestro (`maestros/rubros`). */
export interface RubroMaestro {
  idRubro: number;
  codigo: string;
  nombre: string;
  orden: number;
  puntajeMaximo: number | null;
  tieneDetalle: boolean;
  tieneSubrubros: boolean;
}
