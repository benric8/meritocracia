import { FormControl } from '@angular/forms';
import {
  CREDENCIALES_LOGIN,
  mensajeErrorCampoLogin,
  VALIDADORES_CLAVE_LOGIN,
  VALIDADORES_USUARIO_LOGIN,
} from './credenciales-login.validators';

describe('credenciales-login.validators', () => {
  describe('VALIDADORES_USUARIO_LOGIN', () => {
    const control = new FormControl('', { nonNullable: true, validators: VALIDADORES_USUARIO_LOGIN });

    it('rechaza usuario vacío', () => {
      control.setValue('');
      control.markAsTouched();
      expect(control.invalid).toBe(true);
      expect(mensajeErrorCampoLogin(control, 'usuario')).toBe('El usuario es obligatorio.');
    });

    it('rechaza usuario demasiado corto', () => {
      control.setValue('ab');
      control.markAsTouched();
      expect(control.invalid).toBe(true);
      expect(mensajeErrorCampoLogin(control, 'usuario')).toContain('al menos');
    });

    it('rechaza caracteres no permitidos', () => {
      control.setValue('user@mail');
      control.markAsTouched();
      expect(control.invalid).toBe(true);
      expect(mensajeErrorCampoLogin(control, 'usuario')).toContain('solo puede contener');
    });

    it('acepta usuario válido', () => {
      control.setValue('jperez.01');
      expect(control.valid).toBe(true);
      expect(mensajeErrorCampoLogin(control, 'usuario')).toBeNull();
    });
  });

  describe('VALIDADORES_CLAVE_LOGIN', () => {
    const control = new FormControl('', { nonNullable: true, validators: VALIDADORES_CLAVE_LOGIN });

    it('rechaza contraseña corta', () => {
      control.setValue('1234567');
      control.markAsTouched();
      expect(control.invalid).toBe(true);
      expect(mensajeErrorCampoLogin(control, 'clave')).toContain(
        `${CREDENCIALES_LOGIN.clave.minLength} caracteres`
      );
    });

    it('acepta contraseña con longitud mínima', () => {
      control.setValue('12345678');
      expect(control.valid).toBe(true);
    });
  });
});
