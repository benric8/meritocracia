import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { FechaValoracion } from '../../../domain/models/fecha-valoracion.model';
import { FECHA_VALORACION_PORT } from '../../../domain/ports/fecha-valoracion.port';
import { ListarFechasValoracionReporteUseCase } from './listar-fechas-valoracion-reporte.use-case';

const fecha = (id: string, fechaValoracion: string): FechaValoracion => ({
  id,
  fechaValoracion,
  anio: Number(fechaValoracion.slice(0, 4)),
  resolucion: 'R',
  estado: 'INACTIVO',
  usuarioRegistro: 'admin',
  fechaRegistro: fechaValoracion,
});

describe('ListarFechasValoracionReporteUseCase', () => {
  const puerto = { listarHistorial: vi.fn(), obtenerVigente: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: FECHA_VALORACION_PORT, useValue: puerto }],
    });
  });

  it('ordena de la más reciente a la más antigua y marca la vigente', async () => {
    puerto.listarHistorial.mockReturnValue(
      of([fecha('1', '2024-12-31'), fecha('3', '2026-12-31'), fecha('2', '2025-12-31')])
    );
    puerto.obtenerVigente.mockReturnValue(of(fecha('3', '2026-12-31')));

    const resultado = await firstValueFrom(
      TestBed.inject(ListarFechasValoracionReporteUseCase).ejecutar()
    );

    expect(resultado).toMatchObject({ exito: true, idVigente: '3' });
    expect(resultado.exito && resultado.fechas.map((f) => f.id)).toEqual(['3', '2', '1']);
  });

  it('agrega la vigente si no está en el historial y tolera que no exista', async () => {
    puerto.listarHistorial.mockReturnValue(of([fecha('1', '2024-12-31')]));
    puerto.obtenerVigente.mockReturnValue(of(fecha('9', '2026-12-31')));
    const conVigente = await firstValueFrom(
      TestBed.inject(ListarFechasValoracionReporteUseCase).ejecutar()
    );
    expect(conVigente.exito && conVigente.fechas.map((f) => f.id)).toEqual(['9', '1']);

    puerto.obtenerVigente.mockReturnValue(of(null));
    const sinVigente = await firstValueFrom(
      TestBed.inject(ListarFechasValoracionReporteUseCase).ejecutar()
    );
    expect(sinVigente).toMatchObject({ exito: true, idVigente: null });
  });

  it('devuelve el detalle del error', async () => {
    puerto.listarHistorial.mockReturnValue(throwError(() => new Error('Sin conexión')));
    puerto.obtenerVigente.mockReturnValue(of(null));

    const resultado = await firstValueFrom(
      TestBed.inject(ListarFechasValoracionReporteUseCase).ejecutar()
    );

    expect(resultado).toEqual({ exito: false, detalle: { mensaje: 'Sin conexión' } });
  });
});
