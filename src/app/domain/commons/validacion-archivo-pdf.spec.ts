import { validarArchivoPdf, formatearTamanoBytes } from './validacion-archivo-pdf';

describe('validacion-archivo-pdf', () => {
  const config = { maxTamanoBytes: 1024 };

  function crearArchivo(nombre: string, tipo: string, tamano: number): File {
    return new File([new Uint8Array(tamano)], nombre, { type: tipo });
  }

  it('acepta pdf válido', () => {
    const archivo = crearArchivo('doc.pdf', 'application/pdf', 512);
    expect(validarArchivoPdf(archivo, config).valido).toBe(true);
  });

  it('rechaza extensión no pdf', () => {
    const archivo = crearArchivo('doc.docx', 'application/pdf', 100);
    expect(validarArchivoPdf(archivo, config).valido).toBe(false);
  });

  it('rechaza tamaño excesivo', () => {
    const archivo = crearArchivo('doc.pdf', 'application/pdf', 2048);
    expect(validarArchivoPdf(archivo, config).valido).toBe(false);
  });

  it('formatea tamaños legibles', () => {
    expect(formatearTamanoBytes(500)).toBe('500 B');
    expect(formatearTamanoBytes(2048)).toContain('KB');
  });
});
