import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AsignarSuplenciaUseCase } from '../../../../application/use-cases/suplencias/asignar-suplencia.use-case';
import { ListarMotivosSuplenciaUseCase } from '../../../../application/use-cases/suplencias/listar-motivos-suplencia.use-case';
import { ListarRegistradoresSuplentesUseCase } from '../../../../application/use-cases/suplencias/listar-registradores-suplentes.use-case';
import { ListarSuplenciasUseCase } from '../../../../application/use-cases/suplencias/listar-suplencias.use-case';
import { RetirarSuplenciaUseCase } from '../../../../application/use-cases/suplencias/retirar-suplencia.use-case';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { Asignacion } from './asignacion';

describe('Asignacion', () => {
  let fixture: ComponentFixture<Asignacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Asignacion],
      providers: [
        {
          provide: ListarSuplenciasUseCase,
          useValue: {
            ejecutar: () =>
              of({
                elementos: [
                  {
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
                  },
                ],
                totalRegistros: 1,
                totalPaginas: 1,
                paginaActual: 1,
                tamanioPagina: 10,
              }),
          },
        },
        {
          provide: ListarRegistradoresSuplentesUseCase,
          useValue: {
            ejecutar: () =>
              of([
                { id: 3, usuario: 'jperez', nombreCompleto: 'JUAN PEREZ QUISPE' },
                { id: 7, usuario: 'agomez', nombreCompleto: 'ANA GOMEZ RIOS' },
              ]),
          },
        },
        {
          provide: ListarMotivosSuplenciaUseCase,
          useValue: {
            ejecutar: () =>
              of([
                { codigo: 'LICENCIA', descripcion: 'Licencia' },
                { codigo: 'VACACIONES', descripcion: 'Vacaciones' },
                { codigo: 'DESCANSO_MEDICO', descripcion: 'Descanso médico' },
                { codigo: 'PERMISO_PERSONAL', descripcion: 'Permiso personal' },
              ]),
          },
        },
        { provide: AsignarSuplenciaUseCase, useValue: { ejecutar: () => of() } },
        { provide: RetirarSuplenciaUseCase, useValue: { ejecutar: () => of() } },
        {
          provide: ALERTAS_PORT,
          useValue: {
            error: () => Promise.resolve(),
            exito: () => Promise.resolve(),
            confirmar: () => Promise.resolve(false),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Asignacion);
    await fixture.whenStable();
  });

  it('muestra las columnas de la bandeja de suplencias', () => {
    const cabeceras = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('thead th')
    ).map((th) => th.textContent?.trim());

    expect(cabeceras).toEqual([
      'Código registrador',
      'Magistrado',
      'DNI',
      'Fecha de valoración',
      'Suplente',
      'Observación',
      'Acción',
    ]);
  });

  it('excluye al titular de las opciones de suplente y deja Guardar deshabilitado sin cambios', () => {
    const fila = (fixture.componentInstance as unknown as {
      filas: () => { opcionesSuplente: { id: number }[]; puedeGuardar: () => boolean }[];
    }).filas()[0];

    expect(fila.opcionesSuplente.map((r) => r.id)).toEqual([7]);
    expect(fila.puedeGuardar()).toBe(false);
  });
});
