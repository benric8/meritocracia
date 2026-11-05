/**
 * `src` listo para `<img>` a partir de la foto que devuelve el backend.
 *
 * - Base64 sin prefijo (p. ej. `/9j/...` JPEG) → data URL con el MIME detectado.
 * - Data URL, `http(s):` o `blob:` → se devuelve tal cual.
 * - Vacío o `null` → `''` (la vista muestra el recuadro sin foto).
 */
export function fotoSrc(valor: string | null | undefined): string {
  const foto = String(valor ?? '').replace(/\s/g, '');
  if (!foto) {
    return '';
  }

  if (/^(data:|https?:\/\/|blob:)/i.test(foto)) {
    return foto;
  }

  return `data:${mimeDeBase64(foto)};base64,${foto}`;
}

function mimeDeBase64(base64: string): string {
  // JPEG: /9j/  — PNG: iVBOR  — GIF: R0lGO  — WEBP: UklGR
  if (base64.startsWith('iVBOR')) {
    return 'image/png';
  }
  if (base64.startsWith('R0lGO')) {
    return 'image/gif';
  }
  if (base64.startsWith('UklGR')) {
    return 'image/webp';
  }
  return 'image/jpeg';
}
