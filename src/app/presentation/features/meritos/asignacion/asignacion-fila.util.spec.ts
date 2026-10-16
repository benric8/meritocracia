import { FichaSuplencia, RegistradorSuplente } from '../../../../domain/models/suplencia.model';
import {
  crearFormularioFila,
  fichaConSuplenciaAsignada,
  puedeGuardarFila,
  registradoresParaFila,
  resolverAccionGuardar,
  restablecerFila,
  valoresDesdeFicha,
} from './asignacion-fila.util';

const REGISTRADORES: RegistradorSuplente[] = [
  { id: 3, usuario: 'jperez', nombreCompleto: 'JUAN PEREZ QUISPE' },
  { id: 7, usuario: 'agomez', nombreCompleto: 'ANA GOMEZ RIOS' },
  { id: 9, usuario: 'lruiz', nombreCompleto: 'LUIS RUIZ PAZ' },
];

function ficha(parcial: Partial<FichaSuplencia> = {}): FichaSuplencia {
  return {
    fichaId: '10',
    fechaValoracion: '2026-12-31',
    registradorTitularId: 3,
    codigoRegistradorTitular: 'jperez',
    nombreRegistradorTitular: 'JUAN PEREZ QUISPE',
    dniMagistrado: '45879632',
    nombreMagistrado: 'MARIA LOPEZ TORRES',
    suplenciaId: null,
    registradorSuplenteId: null,
    codigoRegistradorSuplente: null,
    nombreRegistradorSuplente: null,
    motivo: null,
    motivoDescripcion: null,
    fechaInicioSuplencia: null,
    ...parcial,
  };
}

const CON_SUPLENTE = ficha({
  suplenciaId: '15',
  registradorSuplenteId: 7,
  codigoRegistradorSuplente: 'agomez',
  nombreRegistradorSuplente: 'ANA GOMEZ RIOS',
  motivo: 'VACACIONES',
  motivoDescripcion: 'Vacaciones',
});

describe('asignacion-fila.util', () => {
  it('excluye al titular de las opciones de suplente de la fila', () => {
    const opciones = registradoresParaFila(REGISTRADORES, 3);
    expect(opciones.map((r) => r.id)).toEqual([7, 9]);
  });

  it('sin suplente: el motivo inicia deshabilitado y vacío', () => {
    const form = crearFormularioFila(valoresDesdeFicha(ficha()));
    expect(form.controls.motivo.disabled).toBe(true);
    expect(form.controls.motivo.value).toBeNull();
  });

  it('RN-02: al elegir suplente el motivo se habilita y es obligatorio', () => {
    const originales = valoresDesdeFicha(ficha());
    const form = crearFormularioFila(originales);

    form.controls.suplenteId.setValue(7);
    restablecerFila(form, { suplenteId: 7, motivo: null });

    expect(form.controls.motivo.enabled).toBe(true);
    expect(form.valid).toBe(false);
    expect(puedeGuardarFila(form, originales)).toBe(false);

    form.controls.motivo.setValue('LICENCIA');
    expect(puedeGuardarFila(form, originales)).toBe(true);
    expect(resolverAccionGuardar(form, originales)).toEqual({
      tipo: 'ASIGNAR',
      suplenteId: 7,
      motivo: 'LICENCIA',
    });
  });

  it('RN-04: elegir "Sin suplente" limpia y deshabilita el motivo y corresponde retirar', () => {
    const originales = valoresDesdeFicha(CON_SUPLENTE);
    const form = crearFormularioFila(originales);
    expect(form.controls.motivo.value).toBe('VACACIONES');

    restablecerFila(form, { suplenteId: null, motivo: 'VACACIONES' });

    expect(form.controls.motivo.disabled).toBe(true);
    expect(form.controls.motivo.value).toBeNull();
    expect(resolverAccionGuardar(form, originales)).toEqual({ tipo: 'RETIRAR' });
    expect(puedeGuardarFila(form, originales)).toBe(true);
  });

  it('no hay acción si la fila no cambió o sigue sin suplente', () => {
    const conSuplente = valoresDesdeFicha(CON_SUPLENTE);
    expect(resolverAccionGuardar(crearFormularioFila(conSuplente), conSuplente).tipo).toBe(
      'NINGUNA'
    );

    const sinSuplente = valoresDesdeFicha(ficha());
    const form = crearFormularioFila(sinSuplente);
    expect(resolverAccionGuardar(form, sinSuplente).tipo).toBe('NINGUNA');
    expect(puedeGuardarFila(form, sinSuplente)).toBe(false);
  });

  it('cambiar solo el motivo de una suplencia vigente reasigna', () => {
    const originales = valoresDesdeFicha(CON_SUPLENTE);
    const form = crearFormularioFila(originales);
    form.controls.motivo.setValue('LICENCIA');

    expect(resolverAccionGuardar(form, originales)).toEqual({
      tipo: 'ASIGNAR',
      suplenteId: 7,
      motivo: 'LICENCIA',
    });
  });

  it('completa código y nombre del suplente desde la lista tras asignar', () => {
    const actualizada = fichaConSuplenciaAsignada(
      ficha(),
      {
        suplenciaId: '20',
        fichaId: '10',
        registradorSuplenteId: 9,
        motivo: 'LICENCIA',
        motivoDescripcion: 'Licencia',
        fechaInicio: '2026-10-16T09:30:00',
      },
      REGISTRADORES
    );

    expect(actualizada.codigoRegistradorSuplente).toBe('lruiz');
    expect(actualizada.nombreRegistradorSuplente).toBe('LUIS RUIZ PAZ');
    expect(valoresDesdeFicha(actualizada)).toEqual({ suplenteId: 9, motivo: 'LICENCIA' });
  });
});
