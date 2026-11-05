import { of, Subject, throwError } from 'rxjs';
import { dialogoGuardando, mientrasGuardaDialogo } from './rubros.util';

describe('mientrasGuardaDialogo', () => {
  it('marca el diálogo como ocupado mientras dura la petición', () => {
    const ref = {};
    const respuesta = new Subject<string>();

    respuesta.pipe(mientrasGuardaDialogo(ref)).subscribe();
    expect(dialogoGuardando(ref)).toBe(true);

    respuesta.next('ok');
    respuesta.complete();
    expect(dialogoGuardando(ref)).toBe(false);
  });

  it('libera el diálogo si la petición falla, para poder reintentar', () => {
    const ref = {};
    throwError(() => new Error('x'))
      .pipe(mientrasGuardaDialogo(ref))
      .subscribe({ error: () => undefined });

    expect(dialogoGuardando(ref)).toBe(false);
  });

  it('no afecta a otros diálogos', () => {
    const ocupado = {};
    const libre = {};
    new Subject().pipe(mientrasGuardaDialogo(ocupado)).subscribe();
    of(1).pipe(mientrasGuardaDialogo(libre)).subscribe();

    expect(dialogoGuardando(ocupado)).toBe(true);
    expect(dialogoGuardando(libre)).toBe(false);
  });
});
