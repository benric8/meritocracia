import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { BuscarFichasReporteUseCase } from '../../../../application/use-cases/reportes/buscar-fichas-reporte.use-case';
import { DescargarFichaValoracionMeritosUseCase } from '../../../../application/use-cases/reportes/descargar-ficha-valoracion-meritos.use-case';
import { ObtenerFichaValoracionMeritosUseCase } from '../../../../application/use-cases/reportes/obtener-ficha-valoracion-meritos.use-case';
import { FichaResumen } from '../../../../domain/models/ficha-consulta.model';
import { FichaValoracionMeritos as FichaModelo } from '../../../../domain/models/ficha-valoracion-meritos.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { FichaValoracionMeritos } from './ficha-valoracion-meritos';

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

const ficha: FichaModelo = {
  idFicha: '40',
  idFechaValoracion: '3',
  fechaCalificacion: '2026-12-31',
  puntajeTotal: 44.375,
  puntajeMaximo: 60,
  puntajePositivo: 44.875,
  puntajeDemeritos: -0.5,
  antiguedadAcumulada: { anios: 16, meses: 9, dias: 29 },
  idMagistrado: '12',
  apellidosNombres: 'PEREZ GOMEZ JUAN',
  dni: '12345678',
  fechaNacimiento: '1962-05-14',
  edad: 64,
  cargo: 'JUEZ SUPERIOR TITULAR',
  distritoJudicial: 'LIMA',
  primeraEspecialidad: 'CIVIL',
  segundaEspecialidad: null,
  antiguedad: null,
  rubros: [
    {
      numero: 'IX',
      titulo: 'DEMÉRITOS',
      puntajeMaximo: null,
      puntaje: -0.5,
      subrubros: [],
      indicadores: [
        {
          descripcion: 'Amonestaciones',
          cuenta: true,
          cantidad: 1,
          detalle: null,
          anio: null,
          nota: null,
          puntaje: -0.5,
        },
      ],
    },
  ],
};

describe('FichaValoracionMeritos', () => {
  let fixture: ComponentFixture<FichaValoracionMeritos>;
  const buscarFichas = { ejecutar: vi.fn() };
  const obtenerFicha = { ejecutar: vi.fn() };
  const descargarFicha = { ejecutar: vi.fn() };
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

  const crear = async (fichaResultado: unknown) => {
    buscarFichas.ejecutar.mockReset().mockReturnValue(
      of({
        elementos: [resumen('40'), resumen('41', false)],
        totalRegistros: 2,
        totalPaginas: 1,
        paginaActual: 1,
        tamanioPagina: 10,
      })
    );
    obtenerFicha.ejecutar.mockReset().mockReturnValue(of(fichaResultado));
    descargarFicha.ejecutar.mockReset();
    alertas.error.mockClear();

    await TestBed.configureTestingModule({
      imports: [FichaValoracionMeritos],
      providers: [
        { provide: BuscarFichasReporteUseCase, useValue: buscarFichas },
        { provide: ObtenerFichaValoracionMeritosUseCase, useValue: obtenerFicha },
        { provide: DescargarFichaValoracionMeritosUseCase, useValue: descargarFicha },
        { provide: ALERTAS_PORT, useValue: alertas },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FichaValoracionMeritos);
    await fixture.whenStable();
  };

  it('lista las fichas con su fecha de valoración y deshabilita las inactivas', async () => {
    await crear({ exito: true, ficha });

    expect(buscarFichas.ejecutar).toHaveBeenCalledWith(
      { dni: '', apellidos: '', nombres: '' },
      { pagina: 1, tamanio: 10 }
    );
    expect(elemento().textContent).toContain('31/12/2026');
    expect(boton('Ver ficha', 0).disabled).toBe(false);
    expect(boton('Ver ficha', 1).disabled).toBe(true);
  });

  it('muestra la ficha con el juez, el puntaje total y los deméritos negativos', async () => {
    await crear({ exito: true, ficha });
    boton('Ver ficha').click();
    await fixture.whenStable();
    const texto = elemento().textContent ?? '';

    expect(obtenerFicha.ejecutar).toHaveBeenCalledWith('40');
    expect(texto).toContain('Calificado al 31/12/2026');
    expect(elemento().querySelector('.fm__nombre')?.textContent).toBe('Perez Gomez Juan');
    expect(texto).toContain('Juez Superior Titular');
    expect(texto).toContain('16a 9m 29d');
    expect(elemento().querySelector('.ficha__total')?.textContent?.trim()).toBe('44.375');
    expect(texto).toContain('de 60.000');
    // Rubro IX en su tarjeta pequeña, con el puntaje negativo resaltado.
    expect(elemento().querySelector('.fm__otro .fm__negativo')?.textContent).toContain('-0.500');
    expect(
      Array.from(elemento().querySelectorAll('.fm__otro--demeritos .fm__conceptos > div')).map(
        (par) => [par.querySelector('dt')?.textContent?.trim(), par.querySelector('dd')?.textContent?.trim()]
      )
    ).toEqual([['Amonestaciones', '1']]);
    expect(elemento().querySelector('.fm__cierre')?.textContent).toContain('44.375');
  });

  it('pliega los indicadores sin puntaje y los muestra a pedido', async () => {
    const indicador = (descripcion: string, puntaje: number) => ({
      descripcion,
      cuenta: puntaje > 0,
      cantidad: puntaje > 0 ? 1 : 0,
      detalle: null,
      anio: null,
      nota: null,
      puntaje,
    });
    await crear({
      exito: true,
      ficha: {
        ...ficha,
        rubros: [
          {
            numero: 'III',
            titulo: 'GRADOS ACADÉMICOS',
            puntajeMaximo: 17,
            puntaje: 9,
            subrubros: [],
            indicadores: [indicador('Doctorado jurídico', 9), indicador('Maestría', 0)],
          },
        ],
      },
    });
    boton('Ver ficha').click();
    await fixture.whenStable();
    const visibles = () =>
      Array.from(elemento().querySelectorAll('.fm__tbl tbody tr'))
        .filter((fila) => !fila.classList.contains('fm__fila-plegada'))
        .map((fila) => fila.querySelector('td')?.textContent?.trim());

    expect(visibles()).toEqual(['Doctorado jurídico']);

    boton('Ver 1 indicador sin puntaje').click();
    await fixture.whenStable();

    expect(visibles()).toEqual(['Doctorado jurídico', 'Maestría']);
    expect(boton('Ocultar indicadores sin puntaje')).toBeTruthy();
  });

  it('con N017 muestra el mensaje y vuelve a la búsqueda', async () => {
    await crear({ exito: false, detalle: { mensaje: 'La ficha no existe', codigo: 'N017' } });
    boton('Ver ficha').click();
    await fixture.whenStable();

    expect(alertas.error).toHaveBeenCalledOnce();
    expect(boton('Ver ficha')).toBeTruthy();
    expect(buscarFichas.ejecutar).toHaveBeenCalledTimes(2);
  });

  it('descarga el PDF de la ficha en pantalla y muestra el error si falla', async () => {
    await crear({ exito: true, ficha });
    boton('Ver ficha').click();
    await fixture.whenStable();

    descargarFicha.ejecutar.mockReturnValue(of({ exito: false, detalle: { mensaje: 'Error' } }));
    boton('Descargar PDF').click();

    expect(descargarFicha.ejecutar).toHaveBeenCalledWith('40');
    expect(alertas.error).toHaveBeenCalledOnce();
  });
  it('abre la carpeta personal de la misma ficha', async () => {
    await crear({ exito: true, ficha });
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    boton('Ver ficha').click();
    await fixture.whenStable();

    boton('Carpeta personal').click();

    expect(navegar).toHaveBeenCalledWith(['/reportes/carpeta-personal-meritos'], {
      queryParams: { ficha: '40' },
    });
  });
});
