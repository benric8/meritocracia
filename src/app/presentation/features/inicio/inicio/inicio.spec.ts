import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DOCUMENTOS_INSTITUCIONALES_PORT } from '../../../../domain/ports/documentos-institucionales.port';
import { SESION_PORT } from '../../../../domain/ports/sesion.port';
import { AuthStore } from '../../../../infrastructure/security/stores/auth.store';
import { crearSesionPortMock } from '../../../../testing/sesion-port.mock';
import { Inicio } from './inicio';

const documentosMock = {
  elementos: [
    {
      id: '1',
      tipo: 'RESOLUCION' as const,
      nombreArchivo: 'doc.pdf',
      fechaPublicacion: new Date().toISOString(),
      usuarioPublicacion: 'admin',
    },
  ],
  totalRegistros: 1,
  totalPaginas: 1,
  paginaActual: 1,
  tamanioPagina: 5,
};

describe('Inicio por perfil', () => {
  let fixture: ComponentFixture<Inicio>;
  let authStore: InstanceType<typeof AuthStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [
        provideRouter([]),
        AuthStore,
        { provide: SESION_PORT, useValue: crearSesionPortMock() },
        {
          provide: DOCUMENTOS_INSTITUCIONALES_PORT,
          useValue: {
            listar: () => of(documentosMock),
            subir: () => of(documentosMock.elementos[0]),
            reemplazar: () => of(documentosMock.elementos[0]),
            descargar: () => of(new Blob(['pdf'], { type: 'application/pdf' })),
          },
        },
      ],
    }).compileComponents();

    authStore = TestBed.inject(AuthStore);
    fixture = TestBed.createComponent(Inicio);
  });

  function textoVisible(): string {
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('administrador ve formulario de carga y accesos administrativos', () => {
    authStore.establecerSesion('admin01', 'María López', 'Administrador', 'token-test', []);

    const html = textoVisible();

    expect(html).toContain('Publicar documento');
    expect(html).toContain('Seleccionar PDF');
    expect(html).toContain('Reemplazar');
    expect(html).not.toContain('Descargar');
    expect(html).toContain('Accesos administrativos');
  });

  it('registrador ve descarga de PDF y tareas frecuentes sin formulario de carga', () => {
    authStore.establecerSesion('reg01', 'Ana Torres', 'Usuario Registrador', 'token-test', []);

    const html = textoVisible();

    expect(html).not.toContain('Publicar documento');
    expect(html).not.toContain('Seleccionar PDF');
    expect(html).toContain('Descargar');
    expect(html).toContain('Mis tareas frecuentes');
    expect(html).not.toContain('Gestión de usuarios');
  });
});
