import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DescargarCuadroAntiguedadUseCase } from '../../../../application/use-cases/reportes/descargar-cuadro-antiguedad.use-case';
import { ListarFechasValoracionReporteUseCase } from '../../../../application/use-cases/reportes/listar-fechas-valoracion-reporte.use-case';
import { ObtenerCuadroAntiguedadUseCase } from '../../../../application/use-cases/reportes/obtener-cuadro-antiguedad.use-case';
import { CuadroAntiguedad } from '../../../../domain/models/cuadro-antiguedad.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { CuadroAntiguedadSupremos } from './cuadro-antiguedad-supremos';

const cuadro: CuadroAntiguedad = {
  idFechaValoracion: '3',
  fechaValoracion: '2026-12-31',
  nota: '(*) El cálculo del tiempo como Juez Supremo Provisional…',
  filas: [
    {
      orden: 1,
      idMagistrado: '12',
      idFichaValoracion: '40',
      apellidosNombres: 'PEREZ GOMEZ JUAN',
      fechaNacimiento: '1960-05-14',
      fechaJuramentoTitular: '2015-03-02',
      tiempoTitular: { anios: 11, meses: 9, dias: 29 },
      inicioJuezSuperior: null,
      finJuezSuperior: null,
      tiempoJuezSuperior: null,
      inicioProvisional: null,
      finProvisional: null,
      periodosProvisional: 0,
      tiempoProvisional: null,
      fechaColegiatura: '1985-06-20',
      aniosColegiatura: 41,
    },
  ],
};

describe('CuadroAntiguedadSupremos', () => {
  let fixture: ComponentFixture<CuadroAntiguedadSupremos>;
  const obtenerCuadro = { ejecutar: vi.fn() };
  const descargarCuadro = { ejecutar: vi.fn() };
  const alertas = {
    error: vi.fn(() => Promise.resolve()),
    exito: () => Promise.resolve(),
    confirmar: () => Promise.resolve(false),
  };

  const crear = async (resultado: unknown) => {
    obtenerCuadro.ejecutar.mockReset().mockReturnValue(of(resultado));
    descargarCuadro.ejecutar.mockReset();
    alertas.error.mockClear();

    await TestBed.configureTestingModule({
      imports: [CuadroAntiguedadSupremos],
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
        { provide: ObtenerCuadroAntiguedadUseCase, useValue: obtenerCuadro },
        { provide: DescargarCuadroAntiguedadUseCase, useValue: descargarCuadro },
        { provide: ALERTAS_PORT, useValue: alertas },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CuadroAntiguedadSupremos);
    await fixture.whenStable();
  };

  const botones = () =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.cuadro__descargas button'
      )
    );

  it('consulta con la fecha vigente y pinta fecha, filas y nota', async () => {
    await crear({ exito: true, cuadro });
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(obtenerCuadro.ejecutar).toHaveBeenCalledWith('3');
    expect(texto).toContain('Fecha de valoración: 31/12/2026');
    expect(texto).toContain('1º');
    expect(texto).toContain('11 - 09 - 29');
    expect(texto).toContain('(*) El cálculo');
    expect(botones().every((boton) => !boton.disabled)).toBe(true);
  });

  it('sin jueces muestra el mensaje y deshabilita las descargas', async () => {
    await crear({ exito: true, cuadro: { ...cuadro, filas: [] } });

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay Jueces Supremos Titulares para esta fecha de valoración'
    );
    expect(botones().every((boton) => boton.disabled)).toBe(true);
  });

  it('descarga con la fecha del cuadro y avisa si falla', async () => {
    await crear({ exito: true, cuadro });
    descargarCuadro.ejecutar.mockReturnValue(
      of({ exito: false, detalle: { mensaje: 'No existe la fecha', codigo: 'N015' } })
    );

    botones()[0].click();

    expect(descargarCuadro.ejecutar).toHaveBeenCalledWith('excel', '3');
    expect(alertas.error).toHaveBeenCalledOnce();
  });

  it('muestra el error de fecha (N015) en pantalla', async () => {
    await crear({ exito: false, detalle: { mensaje: 'No existe la fecha', codigo: 'N015' } });
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(texto).toContain('No existe la fecha');
    expect(texto).toContain('Elija otra fecha de valoración.');
  });
});
