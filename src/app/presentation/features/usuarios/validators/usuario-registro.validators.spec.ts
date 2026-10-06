import { FormControl } from '@angular/forms';
import {
  mensajeErrorCampoUsuarioRegistro,
  USUARIO_REGISTRO,
  VALIDADORES_NOMBRE_COMPLETO,
} from './usuario-registro.validators';

describe('usuario-registro.validators — nombreCompleto', () => {
  const control = new FormControl('', {
    nonNullable: true,
    validators: VALIDADORES_NOMBRE_COMPLETO,
  });

  it('rechaza nombre vacío', () => {
    control.setValue('');
    control.markAsTouched();
    expect(control.invalid).toBe(true);
    expect(mensajeErrorCampoUsuarioRegistro(control, 'nombreCompleto')).toBe(
      'Los nombres y apellidos son obligatorios.'
    );
  });

  it('rechaza menos de tres palabras', () => {
    control.setValue('Juan Pérez');
    control.markAsTouched();
    expect(control.invalid).toBe(true);
    expect(mensajeErrorCampoUsuarioRegistro(control, 'nombreCompleto')).toBe(
      'Ingrese nombres y al menos dos apellidos.'
    );
  });

  it('rechaza palabras demasiado cortas', () => {
    control.setValue('J A Pérez García');
    control.markAsTouched();
    expect(control.invalid).toBe(true);
    expect(mensajeErrorCampoUsuarioRegistro(control, 'nombreCompleto')).toContain(
      'al menos 2 caracteres'
    );
  });

  it('rechaza números y caracteres especiales', () => {
    control.setValue('Juan Pérez García 123');
    control.markAsTouched();
    expect(control.invalid).toBe(true);
    expect(mensajeErrorCampoUsuarioRegistro(control, 'nombreCompleto')).toBe(
      'Solo se permiten letras y espacios entre palabras.'
    );
  });

  it('rechaza nombre demasiado largo', () => {
    const exceso = 'A'.repeat(USUARIO_REGISTRO.nombreCompleto.maxLength);
    control.setValue(`Juan Pérez ${exceso}`);
    control.markAsTouched();
    expect(control.invalid).toBe(true);
    expect(mensajeErrorCampoUsuarioRegistro(control, 'nombreCompleto')).toContain('no puede superar');
  });

  it('acepta nombre completo válido', () => {
    control.setValue('Juan Pérez García');
    expect(control.valid).toBe(true);
    expect(mensajeErrorCampoUsuarioRegistro(control, 'nombreCompleto')).toBeNull();
  });

  it('acepta nombres con tildes y ñ', () => {
    control.setValue('María Fernández López');
    expect(control.valid).toBe(true);
  });
});
