import { nombreArchivoDeContentDisposition } from './content-disposition.util';

describe('nombreArchivoDeContentDisposition', () => {
  it('prefiere filename* en UTF-8', () => {
    expect(
      nombreArchivoDeContentDisposition(
        `attachment; filename="cuadro.xlsx"; filename*=UTF-8''cuadro-antig%C3%BCedad.xlsx`
      )
    ).toBe('cuadro-antigüedad.xlsx');
  });

  it('usa filename con o sin comillas', () => {
    expect(nombreArchivoDeContentDisposition('attachment; filename="a b.pdf"')).toBe('a b.pdf');
    expect(nombreArchivoDeContentDisposition('attachment; filename=a.pdf')).toBe('a.pdf');
  });

  it('devuelve null sin cabecera o sin nombre', () => {
    expect(nombreArchivoDeContentDisposition(null)).toBeNull();
    expect(nombreArchivoDeContentDisposition('inline')).toBeNull();
  });
});
