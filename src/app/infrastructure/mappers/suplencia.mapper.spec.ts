import { toFichaSuplencia } from './suplencia.mapper';

describe('suplencia.mapper', () => {
  it('trata como null los campos de suplencia omitidos por el backend', () => {
    const fila = toFichaSuplencia({
      idFicha: 10,
      fechaValoracion: '2026-12-31',
      idRegistradorTitular: 3,
      codigoRegistradorTitular: 'jperez',
      nombreRegistradorTitular: 'JUAN PEREZ QUISPE',
      dniMagistrado: 45879632,
      nombreMagistrado: 'MARIA LOPEZ TORRES',
    });

    expect(fila.fichaId).toBe('10');
    expect(fila.dniMagistrado).toBe('45879632');
    expect(fila.suplenciaId).toBeNull();
    expect(fila.registradorSuplenteId).toBeNull();
    expect(fila.nombreRegistradorSuplente).toBeNull();
    expect(fila.motivo).toBeNull();
    expect(fila.fechaInicioSuplencia).toBeNull();
  });

  it('mapea una fila con suplente vigente', () => {
    const fila = toFichaSuplencia({
      idFicha: 10,
      idRegistradorTitular: 3,
      idSuplencia: 15,
      idRegistradorSuplente: 7,
      codigoRegistradorSuplente: 'agomez',
      nombreRegistradorSuplente: 'ANA GOMEZ RIOS',
      motivo: 'VACACIONES',
      motivoDescripcion: 'Vacaciones',
      fechaInicioSuplencia: '2026-10-16 09:30:00',
    });

    expect(fila.suplenciaId).toBe('15');
    expect(fila.registradorSuplenteId).toBe(7);
    expect(fila.motivo).toBe('VACACIONES');
  });
});
