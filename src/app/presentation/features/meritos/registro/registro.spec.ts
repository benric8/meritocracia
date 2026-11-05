import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, Subject } from 'rxjs';
import { ActualizarDatosPersonalesFichaUseCase } from '../../../../application/use-cases/meritos/actualizar-datos-personales-ficha.use-case';
import { CalcularEdadJuezUseCase } from '../../../../application/use-cases/meritos/calcular-edad-juez.use-case';
import { CrearBorradorFichaUseCase } from '../../../../application/use-cases/meritos/crear-borrador-ficha.use-case';
import { ListarNivelesTitularUseCase } from '../../../../application/use-cases/meritos/listar-niveles-titular.use-case';
import { ObtenerDatosSigaJuezUseCase } from '../../../../application/use-cases/meritos/obtener-datos-siga-juez.use-case';
import { ObtenerFechaValoracionVigenteUseCase } from '../../../../application/use-cases/meritos/obtener-fecha-valoracion-vigente.use-case';
import { ObtenerFichaUseCase } from '../../../../application/use-cases/meritos/obtener-ficha.use-case';
import { ResolverFichaDelCicloUseCase } from '../../../../application/use-cases/meritos/resolver-ficha-del-ciclo.use-case';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { RubrosMaestroStore } from '../../../../infrastructure/stores/rubros-maestro.store';
import { Registro } from './registro';

const DNI = '45871293';

/** Acceso a los miembros protegidos/privados que usan las pruebas. */
interface RegistroInterno {
  onBuscarDni(): void;
  onDniInput(event: Event): void;
  modoAccionCabecera(): string | null;
  fichaPreviaId(): string | null;
  fichaId(): string | null;
  buscandoDni(): boolean;
  fotoSiga(): string;
  formulario: {
    controls: Record<string, { value: unknown; setValue(v: unknown): void }>;
  };
}

const sigaOk = {
  exito: true,
  datos: { nombreCompleto: 'PEREZ LOPEZ JUAN', foto: 'data:image/jpeg;base64,/9j/AAA' },
};

describe('Registro', () => {
  let fixture: ComponentFixture<Registro>;
  let component: Registro;
  let resolver: ReturnType<typeof vi.fn>;
  let siga: ReturnType<typeof vi.fn>;
  let obtenerFicha: ReturnType<typeof vi.fn>;
  let alertaError: ReturnType<typeof vi.fn>;

  const interno = () => component as unknown as RegistroInterno;

  function buscar(dni = DNI): void {
    interno().formulario.controls['dni'].setValue(dni);
    interno().onBuscarDni();
  }

  beforeEach(async () => {
    resolver = vi.fn(() => of({ exito: true, resultado: { tipo: 'NUEVA' } }));
    siga = vi.fn(() => of(sigaOk));
    obtenerFicha = vi.fn(() => of({ exito: false, mensaje: 'mock' }));
    alertaError = vi.fn(() => Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [
        {
          provide: ListarNivelesTitularUseCase,
          useValue: { ejecutar: () => of({ exito: true, niveles: [] }) },
        },
        { provide: ObtenerDatosSigaJuezUseCase, useValue: { ejecutar: siga } },
        {
          provide: CalcularEdadJuezUseCase,
          useValue: { ejecutar: () => of({ exito: true, edad: { edad: 45 } }) },
        },
        {
          provide: ObtenerFechaValoracionVigenteUseCase,
          useValue: {
            ejecutar: () =>
              of({
                id: 'fv-test',
                fechaValoracion: '2026-12-31',
                anio: 2026,
                resolucion: 'RA-TEST',
                estado: 'VIGENTE',
                usuarioRegistro: 'TEST',
                fechaRegistro: '2026-01-01T00:00:00',
              }),
          },
        },
        { provide: ResolverFichaDelCicloUseCase, useValue: { ejecutar: resolver } },
        {
          provide: CrearBorradorFichaUseCase,
          useValue: { ejecutar: () => of({ exito: false, mensaje: 'mock' }) },
        },
        {
          provide: ActualizarDatosPersonalesFichaUseCase,
          useValue: { ejecutar: () => of({ exito: false, mensaje: 'mock' }) },
        },
        { provide: ObtenerFichaUseCase, useValue: { ejecutar: obtenerFicha } },
        {
          provide: RubrosMaestroStore,
          useValue: {
            rubros: signal([]),
            cargando: signal(false),
            error: signal(null),
            asegurarCargado: () => of(true),
          },
        },
        {
          provide: ALERTAS_PORT,
          useValue: {
            error: alertaError,
            exito: () => Promise.resolve(),
            confirmar: () => Promise.resolve(false),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Buscar DNI', () => {
    it('NUEVA: consulta SIGA y habilita Registrar', () => {
      buscar();

      expect(resolver).toHaveBeenCalledWith(DNI, 'fv-test');
      expect(siga).toHaveBeenCalledWith(DNI);
      expect(obtenerFicha).not.toHaveBeenCalled();
      expect(interno().modoAccionCabecera()).toBe('NUEVA');
      expect(interno().formulario.controls['nombreCompleto'].value).toBe('PEREZ LOPEZ JUAN');
      expect(interno().fotoSiga()).toBe(sigaOk.datos.foto);
    });

    it('NUEVA_CON_PREVIA: modo importar con sexo y fecha de nacimiento de la ficha anterior', () => {
      resolver.mockReturnValue(
        of({ exito: true, resultado: { tipo: 'NUEVA_CON_PREVIA', fichaPreviaId: '30' } })
      );
      obtenerFicha.mockReturnValue(
        of({
          exito: true,
          ficha: { datosPersonales: { sexo: 'F', fechaNacimiento: '1980-06-20' } },
        })
      );

      buscar();

      expect(obtenerFicha).toHaveBeenCalledWith('30');
      expect(interno().modoAccionCabecera()).toBe('IMPORTAR');
      expect(interno().fichaPreviaId()).toBe('30');
      expect(interno().formulario.controls['sexo'].value).toBe('F');
      expect(interno().formulario.controls['fechaNacimiento'].value).toEqual(
        new Date(1980, 5, 20)
      );
    });

    it('NUEVA_CON_PREVIA: si la ficha anterior falla, igual queda en modo importar', () => {
      resolver.mockReturnValue(
        of({ exito: true, resultado: { tipo: 'NUEVA_CON_PREVIA', fichaPreviaId: '30' } })
      );

      buscar();

      expect(interno().modoAccionCabecera()).toBe('IMPORTAR');
      expect(alertaError).not.toHaveBeenCalled();
    });

    it('EDITABLE sin detalle: modo actualizar con la ficha identificada', () => {
      resolver.mockReturnValue(of({ exito: true, resultado: { tipo: 'EDITABLE', fichaId: '40' } }));

      buscar();

      expect(siga).not.toHaveBeenCalled();
      expect(interno().modoAccionCabecera()).toBe('ACTUALIZAR');
      expect(interno().fichaId()).toBe('40');
      expect(alertaError).toHaveBeenCalledWith('Ficha encontrada', expect.anything());
    });

    it('BLOQUEADA sin detalle: modo bloqueado', () => {
      resolver.mockReturnValue(
        of({ exito: true, resultado: { tipo: 'BLOQUEADA', fichaId: '41' } })
      );

      buscar();

      expect(interno().modoAccionCabecera()).toBe('BLOQUEADA');
      expect(alertaError).toHaveBeenCalledWith('Ficha no editable', expect.anything());
    });

    it('ASIGNADO_A_OTRO: avisa y no habilita ninguna acción', () => {
      resolver.mockReturnValue(
        of({ exito: true, resultado: { tipo: 'ASIGNADO_A_OTRO', fichaId: '42' } })
      );

      buscar();

      expect(interno().modoAccionCabecera()).toBeNull();
      expect(alertaError).toHaveBeenCalledWith(
        'Ficha asignada a otro registrador',
        expect.anything()
      );
    });

    it('cancela la búsqueda en curso si el usuario cambia el DNI', () => {
      const respuesta = new Subject<unknown>();
      let cancelada = false;
      resolver.mockReturnValue(
        new Observable((suscriptor) => {
          const sub = respuesta.subscribe(suscriptor);
          return () => {
            cancelada = true;
            sub.unsubscribe();
          };
        })
      );

      buscar();
      expect(interno().buscandoDni()).toBe(true);

      const input = document.createElement('input');
      input.value = '12345678';
      interno().onDniInput({ target: input } as unknown as Event);

      expect(cancelada).toBe(true);
      expect(interno().buscandoDni()).toBe(false);

      respuesta.next({ exito: true, resultado: { tipo: 'NUEVA' } });
      expect(siga).not.toHaveBeenCalled();
      expect(interno().modoAccionCabecera()).toBeNull();
    });
  });
});
