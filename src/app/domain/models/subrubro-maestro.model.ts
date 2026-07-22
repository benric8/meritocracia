/** Subrubro según catálogo maestro (`maestros/rubros/{idRubro}/subrubros`). */
export interface SubrubroMaestro {
  idSubrubro: number;
  idRubro: number;
  codigo: string;
  nombre: string;
  orden: number;
  puntajeMaximo: number | null;
  aniosVigencia: number | null;
}
