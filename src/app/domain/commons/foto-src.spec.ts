import { fotoSrc } from './foto-src';

describe('fotoSrc', () => {
  it('devuelve vacío si no hay foto', () => {
    expect(fotoSrc(null)).toBe('');
    expect(fotoSrc(undefined)).toBe('');
    expect(fotoSrc('  ')).toBe('');
  });

  it('agrega el prefijo data URL al Base64 puro según el tipo', () => {
    expect(fotoSrc('/9j/AAA')).toBe('data:image/jpeg;base64,/9j/AAA');
    expect(fotoSrc('iVBORw0')).toBe('data:image/png;base64,iVBORw0');
    expect(fotoSrc('/9j/A\nAA ')).toBe('data:image/jpeg;base64,/9j/AAA');
  });

  it('respeta data URL y URLs', () => {
    expect(fotoSrc('data:image/png;base64,iVBOR')).toBe('data:image/png;base64,iVBOR');
    expect(fotoSrc('https://x/foto.jpg')).toBe('https://x/foto.jpg');
    expect(fotoSrc('blob:abc')).toBe('blob:abc');
  });
});
