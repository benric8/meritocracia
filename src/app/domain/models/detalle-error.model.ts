/** Error de operación listo para presentación (sin formateo de UI). */
export interface DetalleError {
  mensaje: string;
  codigo?: string;
  codigoOperacion?: string;
}
