import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PrecargarTokenBasicoUseCase } from '../../../../../application/use-cases/precargar-token-basico.use-case';
import { IniciarSesionUseCase } from '../../../../../application/use-cases/iniciar-sesion.use-case';
import { CompletarSesionPerfilUseCase } from '../../../../../application/use-cases/completar-sesion-perfil.use-case';
import { SessionVigenciaService } from '../../../../../infrastructure/security/session/session-vigencia.service';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: PrecargarTokenBasicoUseCase,
          useValue: { ejecutar: () => of(undefined) },
        },
        {
          provide: IniciarSesionUseCase,
          useValue: { ejecutar: () => of({ tipo: 'error', mensaje: 'test' }) },
        },
        {
          provide: CompletarSesionPerfilUseCase,
          useValue: { ejecutar: () => of({ exito: false, mensaje: 'test' }) },
        },
        {
          provide: SessionVigenciaService,
          useValue: {
            iniciarMonitoreo: () => undefined,
            detenerMonitoreo: () => undefined,
            cerrarSesionManual: () => undefined,
            ngOnDestroy: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
