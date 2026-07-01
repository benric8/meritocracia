import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SESION_PORT } from '../../../../domain/ports/sesion.port';
import { AuthStore } from '../../../../infrastructure/security/stores/auth.store';
import { crearSesionPortMock } from '../../../../testing/sesion-port.mock';
import { Inicio } from './inicio';

describe('Inicio por perfil', () => {
  let fixture: ComponentFixture<Inicio>;
  let authStore: InstanceType<typeof AuthStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [provideRouter([]), AuthStore, { provide: SESION_PORT, useValue: crearSesionPortMock() }],
    }).compileComponents();

    authStore = TestBed.inject(AuthStore);
    fixture = TestBed.createComponent(Inicio);
  });

  function textoVisible(): string {
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('administrador ve estadísticas, carga de PDF y accesos administrativos', () => {
    authStore.establecerSesion('admin01', 'María López', 'Administrador', 'token-test', []);

    const html = textoVisible();

    expect(html).toContain('Fichas activas');
    expect(html).toContain('Subir resolución');
    expect(html).toContain('Reemplazar');
    expect(html).not.toContain('Descargar');
    expect(html).toContain('Accesos administrativos');
    expect(html).toContain('Gestión de usuarios');
    expect(html).toContain('Asignación de registradores');
  });

  it('registrador ve descarga de PDF y tareas frecuentes sin estadísticas ni carga', () => {
    authStore.establecerSesion('reg01', 'Ana Torres', 'Usuario Registrador', 'token-test', []);

    const html = textoVisible();

    expect(html).not.toContain('Fichas activas');
    expect(html).not.toContain('Subir resolución');
    expect(html).not.toContain('Reemplazar');
    expect(html).toContain('Descargar');
    expect(html).toContain('Mis tareas frecuentes');
    expect(html).toContain('Nuevo registro');
    expect(html).toContain('Consulta');
    expect(html).not.toContain('Gestión de usuarios');
  });

  it('muestra vista admin con rol crudo del backend', () => {
    authStore.establecerSesion('admin01', 'María López', 'ADMINISTRADOR', 'token-test', []);

    const html = textoVisible();

    expect(html).toContain('Subir resolución');
    expect(html).toContain('Accesos administrativos');
  });
});
