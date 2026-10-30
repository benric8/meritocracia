import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DescargarCuadroMeritosUseCase } from '../../../../application/use-cases/reportes/descargar-cuadro-meritos.use-case';
import { ListarCatalogosDashboardUseCase } from '../../../../application/use-cases/reportes/listar-catalogos-dashboard.use-case';
import { ListarFechasValoracionReporteUseCase } from '../../../../application/use-cases/reportes/listar-fechas-valoracion-reporte.use-case';
import { ObtenerCuadroMeritosUseCase } from '../../../../application/use-cases/reportes/obtener-cuadro-meritos.use-case';
import {
  CuadroMeritos,
  FILTROS_CUADRO_MERITOS_VACIOS,
  FilaCuadroMeritos,
} from '../../../../domain/models/cuadro-meritos.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { CuadroMeritosSuperiores } from './cuadro-meritos-superiores';

const fila: FilaCuadroMeritos = {
  orden: 17,
  idMagistrado: '12',
  idFichaValoracion: '40',
  dni: '12345678',
  apellidosNombres: 'PEREZ GOMEZ JUAN',
  cesante: true,
  distritoJudicial: 'LIMA',
  primeraEspecialidad: 'CIVIL',
  segundaEspecialidad: null,
  puntajeAntiguedad: 12,
  puntajeGradosTitulos: 7,
  puntajeEstudiosAmag: 4,
  puntajeDoctoradoMaestria: 1.5,
  puntajePasantias: 0,
  puntajeCursos: 1.25,
  puntajeExpositor: 0,
  puntajeAsistenciaEventos: 0,
  puntajeOfimatica: 0,
  puntajeIdiomas: 1,
  puntajePerfeccionamiento: 3.75,
  puntajePublicaciones: 0,
  puntajeDistinciones: 0,
  puntajeDocencia: 2.625,
  puntajeDemeritos: -0.5,
  puntajeTotal: 28.875,
  criterioI: 16.875,
  criterioII: -0.5,
  criterioIII: 3,
};

const cuadro: CuadroMeritos = {
  idFechaValoracion: '3',
  fechaValoracion: '2026-12-31',
  puntajeMaximo: 60,
  notaProduccion: 'Producción Jurisdiccional suspendida.',
  notaCesantes: '(*) Jueces que terminaron la Carrera Judicial',
  filas: [fila],
};

describe('CuadroMeritosSuperiores', () => {
  let fixture: ComponentFixture<CuadroMeritosSuperiores>;
  const obtenerCuadro = { ejecutar: vi.fn() };
  const descargarCuadro = { ejecutar: vi.fn() };
  const alertas = {
    error: vi.fn(() => Promise.resolve()),
    exito: () => Promise.resolve(),
    confirmar: () => Promise.resolve(false),
  };

  const elemento = () => fixture.nativeElement as HTMLElement;
  const boton = (texto: string) =>
    Array.from(elemento().querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes(texto)
    )!;
  const escribir = (nombre: string, valor: string) => {
    const input = elemento().querySelector<HTMLInputElement>(`input[name="${nombre}"]`)!;
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  };

  const crear = async (resultado: unknown) => {
    obtenerCuadro.ejecutar.mockReset().mockReturnValue(of(resultado));
    descargarCuadro.ejecutar.mockReset();
    alertas.error.mockClear();

    await TestBed.configureTestingModule({
      imports: [CuadroMeritosSuperiores],
      providers: [
        {
          provide: ListarFechasValoracionReporteUseCase,
          useValue: {
            ejecutar: () =>
              of({
                exito: true,
                idVigente: '3',
                fechas: [
                  {
                    id: '3',
                    fechaValoracion: '2026-12-31',
                    anio: 2026,
                    resolucion: 'R',
                    estado: 'VIGENTE',
                    usuarioRegistro: 'admin',
                    fechaRegistro: '2026-01-01',
                  },
                ],
              }),
          },
        },
        {
          provide: ListarCatalogosDashboardUseCase,
          useValue: {
            ejecutar: () =>
              of({
                exito: true,
                catalogos: {
                  distritosJudiciales: [{ id: '1', nombre: 'LIMA' }],
                  especialidades: [{ id: '1', nombre: 'CIVIL' }],
                },
              }),
          },
        },
        { provide: ObtenerCuadroMeritosUseCase, useValue: obtenerCuadro },
        { provide: DescargarCuadroMeritosUseCase, useValue: descargarCuadro },
        { provide: ALERTAS_PORT, useValue: alertas },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CuadroMeritosSuperiores);
    await fixture.whenStable();
  };

  it('consulta con la fecha vigente y pinta cabecera, puntajes, cesante y notas', async () => {
    await crear({ exito: true, cuadro });
    const texto = elemento().textContent ?? '';

    expect(obtenerCuadro.ejecutar).toHaveBeenCalledWith({
      ...FILTROS_CUADRO_MERITOS_VACIOS,
      idFechaValoracion: '3',
    });
    expect(texto).toContain('Fecha de valoración: 31/12/2026');
    expect(texto).toContain('Puntaje máximo: 60.000');
    expect(texto).toContain('17º');
    expect(texto).toContain('Suspendido');
    expect(texto).toContain('28.875');
    expect(elemento().querySelector('.cuadro__cesante')?.textContent).toBe('(*)');
    expect(elemento().querySelectorAll('.cuadro__num--negativo')).toHaveLength(2);
    expect(texto).toContain('(*) Jueces que terminaron la Carrera Judicial');
    expect(elemento().querySelectorAll('tbody td, tbody th')).toHaveLength(25);
  });

  it('no busca con un DNI incompleto', async () => {
    await crear({ exito: true, cuadro });
    escribir('dni', '1234');
    await fixture.whenStable();

    boton('Buscar').click();
    await fixture.whenStable();

    expect(obtenerCuadro.ejecutar).toHaveBeenCalledTimes(1);
    expect(elemento().textContent).toContain('Ingrese 8 dígitos.');
  });

  it('descarga con los filtros de la última búsqueda, no con los escritos', async () => {
    await crear({ exito: true, cuadro });
    escribir('apellidosNombres', ' perez ');
    boton('Buscar').click();
    await fixture.whenStable();

    escribir('apellidosNombres', 'QUISPE');
    await fixture.whenStable();
    descargarCuadro.ejecutar.mockReturnValue(of({ exito: false, detalle: { mensaje: 'Error' } }));
    boton('Descargar PDF').click();

    expect(descargarCuadro.ejecutar).toHaveBeenCalledWith('pdf', {
      ...FILTROS_CUADRO_MERITOS_VACIOS,
      idFechaValoracion: '3',
      apellidosNombres: 'perez',
    });
    expect(alertas.error).toHaveBeenCalledOnce();
  });

  it('sin resultados muestra el mensaje y deshabilita las descargas', async () => {
    await crear({ exito: true, cuadro: { ...cuadro, filas: [], notaCesantes: null } });

    expect(elemento().textContent).toContain(
      'No hay Jueces Superiores Titulares que cumplan los filtros'
    );
    expect(boton('Descargar Excel').disabled).toBe(true);
    expect(boton('Descargar PDF').disabled).toBe(true);
  });

  it('muestra el E400 junto al formulario', async () => {
    await crear({ exito: false, detalle: { mensaje: 'numero_documento: inválido', codigo: 'E400' } });

    expect(elemento().querySelector('.cuadro__filtros [role="alert"]')?.textContent).toContain(
      'numero_documento: inválido'
    );
  });
});
