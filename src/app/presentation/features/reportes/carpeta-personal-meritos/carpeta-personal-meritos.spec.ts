import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BuscarFichasReporteUseCase } from '../../../../application/use-cases/reportes/buscar-fichas-reporte.use-case';
import { DescargarCarpetaPersonalMeritosUseCase } from '../../../../application/use-cases/reportes/descargar-carpeta-personal-meritos.use-case';
import { ObtenerCarpetaPersonalMeritosUseCase } from '../../../../application/use-cases/reportes/obtener-carpeta-personal-meritos.use-case';
import { CarpetaPersonalMeritos as CarpetaModelo } from '../../../../domain/models/carpeta-personal-meritos.model';
import { FichaResumen } from '../../../../domain/models/ficha-consulta.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { CarpetaPersonalMeritos } from './carpeta-personal-meritos';

const resumen = (id: string, activa = true): FichaResumen => ({
  id,
  dni: '12345678',
  nombres: 'JUAN',
  apellidoPaterno: 'PEREZ',
  apellidoMaterno: 'GOMEZ',
  nombreCompleto: 'PEREZ GOMEZ JUAN',
  fechaValoracion: '2026-12-31',
  completada: true,
  activa,
});

const carpeta: CarpetaModelo = {
  idFicha: '40',
  fechaValoracion: '2026-12-31',
  fotoBase64: null,
  dni: '12345678',
  apellidosNombres: 'PEREZ GOMEZ JUAN',
  sexo: 'Masculino',
  estadoCivil: null,
  fechaNacimiento: '1962-05-14',
  edad: 64,
  distritoJudicial: 'LIMA',
  despachoJudicial: null,
  cargo: 'JUEZ SUPERIOR',
  condicion: 'TITULAR',
  primeraEspecialidad: 'CIVIL',
  segundaEspecialidad: null,
  anexoTelefonico: null,
  correoInstitucional: null,
  secciones: [
    {
      numero: 'I',
      titulo: 'PRODUCCIÓN JURISDICCIONAL',
      nota: 'Rubro de valoración suspendido.',
      tablas: [],
    },
    {
      numero: 'III',
      titulo: 'GRADOS ACADÉMICOS',
      nota: null,
      tablas: [
        {
          titulo: null,
          columnas: ['GRADO', 'AÑO'],
          anchos: [40, 10],
          filas: [['DOCTOR', '2015']],
        },
      ],
    },
    {
      numero: 'V',
      titulo: 'ESTUDIOS DE PERFECCIONAMIENTO',
      nota: null,
      tablas: [{ titulo: 'V.2 PASANTÍAS', columnas: ['TIPO', 'LUGAR'], anchos: [14, 16], filas: [] }],
    },
  ],
};

describe('CarpetaPersonalMeritos', () => {
  let fixture: ComponentFixture<CarpetaPersonalMeritos>;
  const buscarFichas = { ejecutar: vi.fn() };
  const obtenerCarpeta = { ejecutar: vi.fn() };
  const descargarCarpeta = { ejecutar: vi.fn() };
  const alertas = {
    error: vi.fn(() => Promise.resolve()),
    exito: () => Promise.resolve(),
    confirmar: () => Promise.resolve(false),
  };

  const elemento = () => fixture.nativeElement as HTMLElement;
  const boton = (texto: string, indice = 0) =>
    Array.from(elemento().querySelectorAll<HTMLButtonElement>('button')).filter((b) =>
      b.textContent?.includes(texto)
    )[indice];

  const crear = async (resultado: unknown, queryParams: Record<string, string> = {}) => {
    buscarFichas.ejecutar.mockReset().mockReturnValue(
      of({
        elementos: [resumen('40'), resumen('41', false)],
        totalRegistros: 2,
        totalPaginas: 1,
        paginaActual: 1,
        tamanioPagina: 10,
      })
    );
    obtenerCarpeta.ejecutar.mockReset().mockReturnValue(of(resultado));
    descargarCarpeta.ejecutar.mockReset();
    alertas.error.mockClear();

    await TestBed.configureTestingModule({
      imports: [CarpetaPersonalMeritos],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
        },
        { provide: BuscarFichasReporteUseCase, useValue: buscarFichas },
        { provide: ObtenerCarpetaPersonalMeritosUseCase, useValue: obtenerCarpeta },
        { provide: DescargarCarpetaPersonalMeritosUseCase, useValue: descargarCarpeta },
        { provide: ALERTAS_PORT, useValue: alertas },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CarpetaPersonalMeritos);
    await fixture.whenStable();
  };

  it('busca las fichas y deshabilita las inactivas', async () => {
    await crear({ exito: true, carpeta });

    expect(buscarFichas.ejecutar).toHaveBeenCalledWith(
      { dni: '', apellidos: '', nombres: '' },
      { pagina: 1, tamanio: 10 }
    );
    expect(elemento().textContent).toContain('Anexo 05');
    expect(boton('Ver carpeta', 0).disabled).toBe(false);
    expect(boton('Ver carpeta', 1).disabled).toBe(true);
  });

  it('muestra los datos del juez, el recuadro sin foto y las tablas tal como llegan', async () => {
    await crear({ exito: true, carpeta });
    boton('Ver carpeta').click();
    await fixture.whenStable();
    const texto = elemento().textContent ?? '';

    expect(obtenerCarpeta.ejecutar).toHaveBeenCalledWith('40');
    expect(elemento().querySelector('.cp__nombre')?.textContent).toBe('Perez Gomez Juan');
    expect(elemento().querySelector('.cp__foto-vacia')?.textContent).toContain('Foto del juez');
    expect(texto).toContain('64 años');
    expect(elemento().querySelector('.cp__nota')?.textContent).toContain('suspendido');
    const filas = Array.from(elemento().querySelectorAll('.cp__tbl tbody tr')).map((fila) =>
      Array.from(fila.querySelectorAll('td')).map((td) => td.textContent?.trim())
    );
    expect(filas).toEqual([['DOCTOR', '2015'], ['Sin registros.']]);
    expect(elemento().querySelector('.cp__sin-registros')?.getAttribute('colspan')).toBe('2');
    expect(elemento().querySelector('.cp__codigo')?.textContent).toBe('V.2');
  });

  it('abre la carpeta que llega por ?ficha= sin buscarla', async () => {
    await crear({ exito: true, carpeta }, { ficha: '40' });

    expect(obtenerCarpeta.ejecutar).toHaveBeenCalledWith('40');
    expect(elemento().querySelector('.cp__nombre')).toBeTruthy();
  });

  it('con N017 muestra el mensaje y vuelve a la búsqueda', async () => {
    await crear({ exito: false, detalle: { mensaje: 'La ficha no existe', codigo: 'N017' } });
    boton('Ver carpeta').click();
    await fixture.whenStable();

    expect(alertas.error).toHaveBeenCalledOnce();
    expect(elemento().querySelector('app-carpeta-meritos-vista')).toBeNull();
    expect(buscarFichas.ejecutar).toHaveBeenCalledTimes(2);
  });

  it('con N015 muestra el mensaje sin ofrecer reintentar', async () => {
    await crear({ exito: false, detalle: { mensaje: 'Fecha inexistente', codigo: 'N015' } });
    boton('Ver carpeta').click();
    await fixture.whenStable();

    expect(elemento().querySelector('[role="alert"]')?.textContent).toContain('Fecha inexistente');
    expect(boton('Reintentar')).toBeUndefined();
  });

  it('descarga el PDF de la carpeta y muestra el error si falla', async () => {
    await crear({ exito: true, carpeta });
    boton('Ver carpeta').click();
    await fixture.whenStable();

    descargarCarpeta.ejecutar.mockReturnValue(of({ exito: false, detalle: { mensaje: 'Error' } }));
    boton('Descargar PDF').click();

    expect(descargarCarpeta.ejecutar).toHaveBeenCalledWith('40');
    expect(alertas.error).toHaveBeenCalledOnce();
  });
});
