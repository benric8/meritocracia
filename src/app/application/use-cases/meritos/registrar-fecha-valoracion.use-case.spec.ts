import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { RegistrarFechaValoracionUseCase } from './registrar-fecha-valoracion.use-case';
import { FECHA_VALORACION_PORT } from '../../../domain/ports/fecha-valoracion.port';
import { FechaValoracion } from '../../../domain/models/fecha-valoracion.model';

const fechaMock: FechaValoracion = {
  id: '1',
  fechaValoracion: '2026-07-02',
  anio: 2026,
  resolucion: 'Res. Admin. N° 045-2026-CEJ',
  estado: 'VIGENTE',
  usuarioRegistro: 'Admin',
  fechaRegistro: '2026-07-01T15:30:00.000Z',
};

describe('RegistrarFechaValoracionUseCase', () => {
  it('rechaza resolución vacía sin llamar al puerto', async () => {
    const registrar = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        RegistrarFechaValoracionUseCase,
        {
          provide: FECHA_VALORACION_PORT,
          useValue: { obtenerVigente: () => of(null), listarHistorial: () => of([]), registrar },
        },
      ],
    });

    const useCase = TestBed.inject(RegistrarFechaValoracionUseCase);
    const resultado = await firstValueFrom(
      useCase.ejecutar({ fechaValoracion: '2026-07-02', resolucion: '  ' }, 'Admin')
    );

    expect(resultado.exito).toBe(false);
    expect(registrar).not.toHaveBeenCalled();
  });

  it('registra cuando los datos son válidos', async () => {
    const registrar = vi.fn().mockReturnValue(of(fechaMock));
    TestBed.configureTestingModule({
      providers: [
        RegistrarFechaValoracionUseCase,
        {
          provide: FECHA_VALORACION_PORT,
          useValue: { obtenerVigente: () => of(null), listarHistorial: () => of([]), registrar },
        },
      ],
    });

    const useCase = TestBed.inject(RegistrarFechaValoracionUseCase);
    const resultado = await firstValueFrom(
      useCase.ejecutar(
        { fechaValoracion: '2026-07-02', resolucion: 'Res. Admin. N° 045-2026-CEJ' },
        'Admin'
      )
    );

    expect(resultado).toEqual({ exito: true, fecha: fechaMock });
    expect(registrar).toHaveBeenCalledOnce();
  });

  it('mapea error del puerto a resultado fallido', async () => {
    TestBed.configureTestingModule({
      providers: [
        RegistrarFechaValoracionUseCase,
        {
          provide: FECHA_VALORACION_PORT,
          useValue: {
            obtenerVigente: () => of(null),
            listarHistorial: () => of([]),
            registrar: () => throwError(() => new Error('fallo de red')),
          },
        },
      ],
    });

    const useCase = TestBed.inject(RegistrarFechaValoracionUseCase);
    const resultado = await firstValueFrom(
      useCase.ejecutar(
        { fechaValoracion: '2026-07-02', resolucion: 'Res. Admin. N° 045-2026-CEJ' },
        'Admin'
      )
    );

    expect(resultado.exito).toBe(false);
    if (!resultado.exito) {
      expect(resultado.detalle?.mensaje).toContain('fallo de red');
    }
  });
});
