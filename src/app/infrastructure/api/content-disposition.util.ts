/** Nombre de archivo de `Content-Disposition`: prefiere `filename*` (UTF-8) sobre `filename`. */
export function nombreArchivoDeContentDisposition(cabecera: string | null): string | null {
  if (!cabecera) {
    return null;
  }

  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(cabecera);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      // Codificación inválida: se intenta con `filename`.
    }
  }

  const simple = /filename="?([^";]+)"?/i.exec(cabecera);
  return simple ? simple[1].trim() : null;
}
