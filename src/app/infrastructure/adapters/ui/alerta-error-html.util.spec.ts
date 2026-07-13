import { escaparHtml, formatearHtmlDetalleError } from './alerta-error-html.util';

describe('alerta-error-html.util', () => {
  describe('escaparHtml', () => {
    it('escapa caracteres peligrosos', () => {
      expect(escaparHtml(`<script>alert("x")</script> & 'y'`)).toBe(
        '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;'
      );
    });

    it('deja texto plano sin cambios relevantes', () => {
      expect(escaparHtml('Operación no permitida')).toBe('Operación no permitida');
    });
  });

  describe('formatearHtmlDetalleError', () => {
    it('devuelve solo el mensaje cuando no hay codigoOperacion', () => {
      expect(
        formatearHtmlDetalleError({ mensaje: 'No se pudo cambiar el estado.' })
      ).toBe('No se pudo cambiar el estado.');
    });

    it('ignora codigoOperacion en blanco', () => {
      expect(
        formatearHtmlDetalleError({ mensaje: 'Fallo', codigoOperacion: '   ' })
      ).toBe('Fallo');
    });

    it('coloca el código de operación debajo del mensaje', () => {
      const html = formatearHtmlDetalleError({
        mensaje: 'Usuario no encontrado.',
        codigoOperacion: 'OP-123',
      });

      expect(html).toBe(
        'Usuario no encontrado.<br><br><small><strong>Código de operación:</strong> OP-123</small>'
      );
    });

    it('escapa mensaje y código de operación', () => {
      const html = formatearHtmlDetalleError({
        mensaje: '<b>error</b>',
        codigoOperacion: '<op>',
      });

      expect(html).toContain('&lt;b&gt;error&lt;/b&gt;');
      expect(html).toContain('&lt;op&gt;');
      expect(html).not.toContain('<b>');
    });
  });
});
