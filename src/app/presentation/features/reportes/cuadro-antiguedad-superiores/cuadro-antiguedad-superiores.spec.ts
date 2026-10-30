import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DescargarCuadroAntiguedadSuperioresUseCase } from '../../../../application/use-cases/reportes/descargar-cuadro-antiguedad-superiores.use-case';
import { ListarCatalogosDashboardUseCase } from '../../../../application/use-cases/reportes/listar-catalogos-dashboard.use-case';
import { ListarFechasValoracionReporteUseCase } from '../../../../application/use-cases/reportes/listar-fechas-valoracion-reporte.use-case';
import { ObtenerCuadroAntiguedadSuperioresUseCase } from '../../../../application/use-cases/reportes/obtener-cuadro-antiguedad-superiores.use-case';
import {
  CuadroAntiguedadSuperiores as CuadroModelo,
  FilaCuadroAntiguedadSuperiores,
} from '../../../../domain/models/cuadro-antiguedad-superiores.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { CuadroAntiguedadSuperiores } from './cuadro-antiguedad-superiores';

const fila: FilaCuadroAntiguedadSuperiores = {
  orden: 1,
  ordenNacional: 17,
  idMagistrado: '12',
  idFichaValoracion: '40',
  apellidosNombres: 'PEREZ GOMEZ JUAN',
  cesante: true,
  fechaNacimiento: '1962-05-14',
  distritoJudicial: 'LIMA',
  fechaJuramentoTitular: '2010-03-02',
  horaJuramentoTitular: '10:30:00',
  fechaCese: null,
  tiempoTitularidad: { anios: 4, meses: 11, dias: 27 },
  fechaReincorporacion: null,
  tiempoReincorporacion: null,
  tiempoTotal: { anios: 10, meses: 11, dias: 27 },
  inicioJuezEspecializado: null,
  finJuezEspecializado: null,
  tiempoJuezEspecializado: { anios: 0, meses: 0, dias: 0 },
  inicioProvisional: null,
  finProvisional: null,
  periodosProvisional: 0,
  tiempoProvisional: { anios: 0, meses: 0, dias: 0 },
  fechaColegiatura: '1990-06-20',
  aniosColegiatura: 36,
};

const cuadro: CuadroModelo = {
  idFechaValoracion: '3',
  fechaValoracion: '2026-12-31',
  idDistritoJudicial: '',
  distritoJudicial: null,
  notaCesantes: '(*) Jueces que terminaron la Carrera Judicial',
  notaDistrito: '(**) Corte Superior de origen',
  notaProvisional: '(***) Varios periodos',
  filas: [fila],
};

describe('CuadroAntiguedadSuperiores', () => {
  let fixture: ComponentFixture<CuadroAntiguedadSuperiores>;
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
  const componente = () =>
    fixture.componentInstance as unknown as {
      onFiltroCambiado(campo: string, valor: string): void;
    };

  const crear = async (resultado: unknown) => {
    obtenerCuadro.ejecutar.mockReset().mockReturnValue(of(resultado));
    descargarCuadro.ejecutar.mockReset();
    alertas.error.mockClear();

    await TestBed.configureTestingModule({
      imports: [CuadroAntiguedadSuperiores],
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
                  distritosJudiciales: [{ id: '7', nombre: 'CUSCO' }],
                  especialidades: [],
                },
              }),
          },
        },
        { provide: ObtenerCuadroAntiguedadSuperioresUseCase, useValue: obtenerCuadro },
        { provide: DescargarCuadroAntiguedadSuperioresUseCase, useValue: descargarCuadro },
        { provide: ALERTAS_PORT, useValue: alertas },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CuadroAntiguedadSuperiores);
    await fixture.whenStable();
  };

  it('consulta el cuadro nacional con la fecha vigente y pinta las 20 columnas y las notas', async () => {
    await crear({ exito: true, cuadro });
    const texto = elemento().textContent ?? '';

    expect(obtenerCuadro.ejecutar).toHaveBeenCalledWith({
      idFechaValoracion: '3',
      idDistritoJudicial: '',
    });
    expect(texto).toContain('Fecha de valoración: 31/12/2026');
    expect(texto).toContain('Nivel nacional');
    expect(texto).toContain('1º');
    expect(texto).toContain('10 - 11 - 27');
    expect(texto).not.toContain('00 - 00 - 00');
    expect(elemento().querySelector('.cuadro__cesante')?.textContent).toBe('(*)');
    expect(elemento().querySelectorAll('tbody td, tbody th')).toHaveLength(20);
    const notas = Array.from(elemento().querySelectorAll('.cuadro__notas p')).map((p) =>
      p.textContent?.trim()
    );
    expect(notas).toEqual([
      '(*) Jueces que terminaron la Carrera Judicial',
      '(**) Corte Superior de origen',
      '(***) Varios periodos',
    ]);
  });

  it('con una Corte sin filas usa el nombre de la opción y deshabilita las descargas', async () => {
    await crear({ exito: true, cuadro });
    obtenerCuadro.ejecutar.mockReturnValue(
      of({ exito: true, cuadro: { ...cuadro, filas: [], notaCesantes: null } })
    );

    componente().onFiltroCambiado('idDistritoJudicial', '7');
    boton('Buscar').click();
    await fixture.whenStable();

    expect(obtenerCuadro.ejecutar).toHaveBeenLastCalledWith({
      idFechaValoracion: '3',
      idDistritoJudicial: '7',
    });
    const texto = elemento().textContent ?? '';
    expect(texto).toContain('Corte Superior de Justicia de CUSCO');
    expect(texto).toContain('No hay Jueces Superiores Titulares para la Corte o la fecha');
    expect(boton('Descargar Excel').disabled).toBe(true);
  });

  it('descarga con los filtros de la última búsqueda, no con los elegidos', async () => {
    await crear({ exito: true, cuadro });
    componente().onFiltroCambiado('idDistritoJudicial', '7');
    await fixture.whenStable();
    expect(elemento().textContent).toContain('Cambios sin buscar');

    descargarCuadro.ejecutar.mockReturnValue(of({ exito: false, detalle: { mensaje: 'Error' } }));
    boton('Descargar PDF').click();

    expect(descargarCuadro.ejecutar).toHaveBeenCalledWith('pdf', {
      idFechaValoracion: '3',
      idDistritoJudicial: '',
    });
    expect(alertas.error).toHaveBeenCalledOnce();
  });

  it('con N015 pide elegir otra fecha', async () => {
    await crear({ exito: false, detalle: { mensaje: 'No existe la fecha', codigo: 'N015' } });

    expect(elemento().textContent).toContain('Elija otra fecha de valoración');
  });
});
