import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, Subject } from 'rxjs';
import { ObtenerPuntajesFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-puntajes-ficha.use-case';
import { ObtenerRubroAmagFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-amag-ficha.use-case';
import { ObtenerRubroAntiguedadFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-antiguedad-ficha.use-case';
import { ObtenerRubroAsistenciasEventosFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-asistencias-eventos-ficha.use-case';
import { ObtenerRubroCertamenesAcademicosFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-certamenes-academicos-ficha.use-case';
import { ObtenerRubroCursosEspecializacionFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-cursos-especializacion-ficha.use-case';
import { ObtenerRubroDemeritoFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-demerito-ficha.use-case';
import { ObtenerRubroDistincionFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-distincion-ficha.use-case';
import { ObtenerRubroDocenciaFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-docencia-ficha.use-case';
import { ObtenerRubroEstudiosPosgradoFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-estudios-posgrado-ficha.use-case';
import { ObtenerRubroGradosTitulosFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-grados-titulos-ficha.use-case';
import { ObtenerRubroIdiomaFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-idioma-ficha.use-case';
import { ObtenerRubroOfimaticaFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-ofimatica-ficha.use-case';
import { ObtenerRubroPasantiasFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-pasantias-ficha.use-case';
import { ObtenerRubroPublicacionJuridicaFichaUseCase } from '../../../../../../application/use-cases/meritos/obtener-rubro-publicacion-juridica-ficha.use-case';
import {
  crearRubroAntiguedadVacio,
  crearRubroIdiomaVacio,
  FichaValoracion,
  PuntajesFicha,
} from '../../../../../../domain/models/ficha-valoracion.model';
import { RubroMaestro } from '../../../../../../domain/models/rubro-maestro.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { RubrosMaestroStore } from '../../../../../../infrastructure/stores/rubros-maestro.store';
import { RubrosPanel } from './rubros-panel';

/**
 * Pruebas del comportamiento del panel (carga perezosa, puntajes, cambio de cargo).
 * La plantilla se reemplaza por una vacía: aquí solo se prueba la lógica del componente.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Firma = (...args: any[]) => any;
type Fn = ReturnType<typeof vi.fn<Firma>>;

/** Caso de uso de carga por código de rubro. */
const CASOS = {
  B: ObtenerRubroAntiguedadFichaUseCase,
  C: ObtenerRubroGradosTitulosFichaUseCase,
  D: ObtenerRubroAmagFichaUseCase,
  F: ObtenerRubroIdiomaFichaUseCase,
  G: ObtenerRubroPublicacionJuridicaFichaUseCase,
  H: ObtenerRubroDistincionFichaUseCase,
  I: ObtenerRubroDocenciaFichaUseCase,
  J: ObtenerRubroDemeritoFichaUseCase,
  E1: ObtenerRubroEstudiosPosgradoFichaUseCase,
  E2: ObtenerRubroPasantiasFichaUseCase,
  E3: ObtenerRubroCursosEspecializacionFichaUseCase,
  E4: ObtenerRubroCertamenesAcademicosFichaUseCase,
  E5: ObtenerRubroAsistenciasEventosFichaUseCase,
  E6: ObtenerRubroOfimaticaFichaUseCase,
} as const;
type Codigo = keyof typeof CASOS;
const CODIGOS = Object.keys(CASOS) as Codigo[];

/** Rubro mínimo con puntaje; B guarda el puntaje en `titularidad`. */
function rubroCon(codigo: Codigo, puntaje: number): unknown {
  if (codigo === 'B') {
    const b = crearRubroAntiguedadVacio();
    return { ...b, titularidad: { ...b.titularidad, puntaje } };
  }
  return { ...crearRubroIdiomaVacio(), puntajeTotal: puntaje };
}

function maestro(codigo: string, tieneSubrubros = false): RubroMaestro {
  return {
    idRubro: codigo.charCodeAt(0),
    codigo,
    nombre: codigo,
    orden: 1,
    puntajeMaximo: null,
    tieneDetalle: true,
    tieneSubrubros,
  };
}

function puntajesOficiales(valores: Record<string, number>): PuntajesFicha {
  return {
    idFicha: 'f1',
    puntajeTotal: 0,
    rubros: Object.entries(valores).map(([codigo, puntaje], i) => ({
      idRubro: i,
      codigo,
      nombre: codigo,
      puntaje,
    })) as PuntajesFicha['rubros'],
  };
}

/** Miembros protegidos que usan las pruebas. */
interface PanelInterno {
  onRubroAbierto(rubro: RubroMaestro): void;
  onFichaActualizada(ficha: FichaValoracion): void;
  puntajeRubro(codigo: string): number;
  cargandoRubro(rubro: RubroMaestro): boolean;
  mensajeCargaRubro(rubro: RubroMaestro): string;
}

describe('RubrosPanel', () => {
  let fixture: ComponentFixture<RubrosPanel>;
  let panel: PanelInterno;
  let casos: Record<Codigo, Fn>;
  let obtenerPuntajes: Fn;
  let alertaError: Fn;

  beforeEach(async () => {
    casos = {} as Record<Codigo, Fn>;
    for (const codigo of CODIGOS) {
      casos[codigo] = vi.fn<Firma>(() => of({ exito: true, rubro: rubroCon(codigo, 1) }));
    }
    obtenerPuntajes = vi.fn<Firma>(() => of({ exito: false, mensaje: 'sin puntajes' }));
    alertaError = vi.fn<Firma>(() => Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [RubrosPanel],
      providers: [
        ...CODIGOS.map((codigo) => ({
          provide: CASOS[codigo],
          useValue: { ejecutar: (id: string) => casos[codigo](id) },
        })),
        { provide: ObtenerPuntajesFichaUseCase, useValue: { ejecutar: obtenerPuntajes } },
        {
          provide: RubrosMaestroStore,
          useValue: {
            asegurarSubrubrosCargados: () => of(true),
            errorSubrubros: () => null,
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
    })
      .overrideComponent(RubrosPanel, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(RubrosPanel);
    panel = fixture.componentInstance as unknown as PanelInterno;
    fixture.componentRef.setInput('fichaId', 'f1');
    fixture.componentRef.setInput('nivelId', '3');
    fixture.detectChanges();
  });

  describe('carga al abrir un rubro', () => {
    for (const codigo of ['B', 'C', 'D', 'F', 'G', 'H', 'I', 'J'] as const) {
      it(`${codigo}: carga una sola vez por ficha y toma su puntaje`, () => {
        casos[codigo].mockReturnValue(of({ exito: true, rubro: rubroCon(codigo, 7) }));

        panel.onRubroAbierto(maestro(codigo));
        panel.onRubroAbierto(maestro(codigo));

        expect(casos[codigo]).toHaveBeenCalledTimes(1);
        expect(casos[codigo]).toHaveBeenCalledWith('f1');
        expect(panel.puntajeRubro(codigo)).toBe(7);
      });
    }

    it('abrir E carga los seis subrubros una sola vez', () => {
      panel.onRubroAbierto(maestro('E', true));
      panel.onRubroAbierto(maestro('E', true));

      for (const codigo of ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'] as const) {
        expect(casos[codigo]).toHaveBeenCalledTimes(1);
      }
      expect(casos.C).not.toHaveBeenCalled();
    });

    it('sin ficha no carga nada', () => {
      fixture.componentRef.setInput('fichaId', null);
      fixture.detectChanges();

      panel.onRubroAbierto(maestro('C'));
      panel.onRubroAbierto(maestro('E', true));

      for (const codigo of CODIGOS) {
        expect(casos[codigo]).not.toHaveBeenCalled();
      }
    });

    it('muestra el estado de carga y su texto mientras espera', () => {
      const respuesta = new Subject<unknown>();
      casos.F.mockReturnValue(respuesta as Observable<unknown>);

      panel.onRubroAbierto(maestro('F'));
      expect(panel.cargandoRubro(maestro('F'))).toBe(true);
      expect(panel.mensajeCargaRubro(maestro('F'))).toBe(
        'Cargando estudios de idioma registrados…'
      );

      // Mientras carga, abrir de nuevo no repite la petición.
      panel.onRubroAbierto(maestro('F'));
      expect(casos.F).toHaveBeenCalledTimes(1);

      respuesta.next({ exito: true, rubro: rubroCon('F', 2) });
      respuesta.complete();
      expect(panel.cargandoRubro(maestro('F'))).toBe(false);
    });

    it('textos de carga por rubro', () => {
      expect(panel.mensajeCargaRubro(maestro('B'))).toBe('Cargando antigüedad registrada…');
      expect(panel.mensajeCargaRubro(maestro('C'))).toBe('Cargando grados registrados…');
      expect(panel.mensajeCargaRubro(maestro('D'))).toBe('Cargando estudios AMAG registrados…');
      expect(panel.mensajeCargaRubro(maestro('G'))).toBe(
        'Cargando publicaciones jurídicas registradas…'
      );
      expect(panel.mensajeCargaRubro(maestro('H'))).toBe('Cargando distinciones registradas…');
      expect(panel.mensajeCargaRubro(maestro('I'))).toBe('Cargando docencia registrada…');
      expect(panel.mensajeCargaRubro(maestro('J'))).toBe('Cargando deméritos registrados…');
      expect(panel.mensajeCargaRubro(maestro('A'))).toBe('Cargando…');
    });

    it('si falla, avisa y permite reintentar al volver a abrir', () => {
      casos.C.mockReturnValue(of({ exito: false, mensaje: 'caído' }));

      panel.onRubroAbierto(maestro('C'));
      expect(alertaError).toHaveBeenCalledWith(
        'No se pudo cargar el rubro C',
        expect.objectContaining({ mensaje: 'caído' })
      );

      casos.C.mockReturnValue(of({ exito: true, rubro: rubroCon('C', 4) }));
      panel.onRubroAbierto(maestro('C'));
      expect(casos.C).toHaveBeenCalledTimes(2);
      expect(panel.puntajeRubro('C')).toBe(4);
    });

    it('los errores de subrubros indican el subrubro', () => {
      casos.E3.mockReturnValue(of({ exito: false, mensaje: 'x' }));

      panel.onRubroAbierto(maestro('E', true));

      expect(alertaError).toHaveBeenCalledWith('No se pudo cargar el subrubro E3', expect.anything());
    });

    it('emite el rubro cargado hacia el registro', () => {
      const emitidos: unknown[] = [];
      fixture.componentInstance.rubroIdiomaCargado.subscribe((r) => emitidos.push(r));

      panel.onRubroAbierto(maestro('F'));

      expect(emitidos).toHaveLength(1);
    });
  });

  describe('puntajes', () => {
    it('A siempre es 0 y E muestra el puntaje oficial recibido', () => {
      fixture.componentRef.setInput('puntajeRubroE', 12.5);
      fixture.detectChanges();

      expect(panel.puntajeRubro('A')).toBe(0);
      expect(panel.puntajeRubro('E')).toBe(12.5);
      expect(panel.puntajeRubro('Z')).toBe(0);
    });

    it('toma el puntaje inicial de lo que entrega el registro', () => {
      fixture.componentRef.setInput('rubroIdioma', rubroCon('F', 3));
      fixture.componentRef.setInput('rubroAntiguedad', rubroCon('B', 9));
      fixture.detectChanges();

      expect(panel.puntajeRubro('F')).toBe(3);
      expect(panel.puntajeRubro('B')).toBe(9);
    });

    it('una vez cargado, el dato del registro no pisa lo cargado', () => {
      casos.F.mockReturnValue(of({ exito: true, rubro: rubroCon('F', 5) }));
      panel.onRubroAbierto(maestro('F'));

      fixture.componentRef.setInput('rubroIdioma', rubroCon('F', 1));
      fixture.detectChanges();

      expect(panel.puntajeRubro('F')).toBe(5);
    });

    it('al actualizar la ficha toma sus puntajes, la reenvía y pide los oficiales', () => {
      const emitidas: FichaValoracion[] = [];
      fixture.componentInstance.fichaActualizada.subscribe((f) => emitidas.push(f));
      const ficha = {
        id: 'f1',
        rubroAntiguedad: rubroCon('B', 2),
        rubroGradosTitulos: rubroCon('C', 3),
        rubroOfimatica: rubroCon('E6', 4),
        rubroIdioma: null,
        puntajeRubroE: 6,
      } as unknown as FichaValoracion;

      panel.onFichaActualizada(ficha);

      expect(panel.puntajeRubro('B')).toBe(2);
      expect(panel.puntajeRubro('C')).toBe(3);
      expect(panel.puntajeRubro('F')).toBe(0);
      expect(panel.puntajeRubro('E')).toBe(6);
      expect(emitidas).toEqual([ficha]);
      expect(obtenerPuntajes).toHaveBeenCalledWith('f1');
    });

    it('aplica los puntajes oficiales del backend y los reenvía', () => {
      const oficiales = puntajesOficiales({ B: 11, C: 22, E: 33, 'E.1': 44 });
      obtenerPuntajes.mockReturnValue(of({ exito: true, puntajes: oficiales }));
      const emitidos: PuntajesFicha[] = [];
      fixture.componentInstance.puntajesOficiales.subscribe((p) => emitidos.push(p));

      panel.onFichaActualizada({ id: 'f1' } as unknown as FichaValoracion);

      expect(panel.puntajeRubro('B')).toBe(11);
      expect(panel.puntajeRubro('C')).toBe(22);
      expect(panel.puntajeRubro('E')).toBe(33);
      expect(emitidos).toEqual([oficiales]);
    });
  });

  describe('detalle mostrado', () => {
    const datos = (codigo: Codigo) =>
      (fixture.componentInstance as unknown as { datos(c: Codigo): unknown }).datos(codigo);

    it('el puntaje oficial también se copia al detalle mostrado (B en la titularidad)', () => {
      panel.onRubroAbierto(maestro('B'));
      panel.onRubroAbierto(maestro('C'));
      obtenerPuntajes.mockReturnValue(
        of({ exito: true, puntajes: puntajesOficiales({ B: 11, C: 22 }) })
      );

      panel.onFichaActualizada({ id: 'f1' } as unknown as FichaValoracion);

      expect(datos('B')).toMatchObject({ titularidad: { puntaje: 11 } });
      expect(datos('C')).toMatchObject({ puntajeTotal: 22 });
    });

    it('al actualizar la ficha, B conserva su detalle y los demás toman el de la ficha', () => {
      panel.onRubroAbierto(maestro('B'));
      const antes = datos('B');
      const idiomaFicha = rubroCon('F', 8);

      panel.onFichaActualizada({
        id: 'f1',
        rubroAntiguedad: rubroCon('B', 2),
        rubroIdioma: idiomaFicha,
      } as unknown as FichaValoracion);

      expect(datos('B')).toBe(antes);
      expect(panel.puntajeRubro('B')).toBe(2);
      expect(datos('F')).toBe(idiomaFicha);
    });
  });

  describe('cambio de cargo', () => {
    it('recarga la antigüedad ya cargada y pide los puntajes oficiales', () => {
      panel.onRubroAbierto(maestro('B'));
      expect(casos.B).toHaveBeenCalledTimes(1);

      fixture.componentRef.setInput('nivelId', '4');
      fixture.detectChanges();

      expect(casos.B).toHaveBeenCalledTimes(2);
      expect(obtenerPuntajes).toHaveBeenCalledWith('f1');
    });

    it('si la antigüedad no se había abierto, solo pide los puntajes oficiales', () => {
      fixture.componentRef.setInput('nivelId', '4');
      fixture.detectChanges();

      expect(casos.B).not.toHaveBeenCalled();
      expect(obtenerPuntajes).toHaveBeenCalledWith('f1');
    });
  });
});
