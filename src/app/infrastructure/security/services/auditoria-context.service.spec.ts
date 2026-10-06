import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { auditoriaDefault, constantes } from '../../../domain/commons/constants';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { crearSesionPortMock } from '../../../testing/sesion-port.mock';
import { PublicIpService } from '../../network/public-ip.service';
import { AuditoriaContextService } from './auditoria-context.service';

describe('AuditoriaContextService', () => {
  let service: AuditoriaContextService;
  let publicIp: { obtenerIpPublica: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    sessionStorage.clear();
    publicIp = {
      obtenerIpPublica: vi.fn(() => of('203.0.113.77')),
    };

    TestBed.configureTestingModule({
      providers: [
        AuditoriaContextService,
        { provide: SESION_PORT, useValue: crearSesionPortMock() },
        { provide: PublicIpService, useValue: publicIp },
      ],
    });

    service = TestBed.inject(AuditoriaContextService);
  });

  it('adjunta la IP pública en las cabeceras de auditoría', async () => {
    const cabeceras = await firstValueFrom(service.obtenerCabecerasHttp('jperez'));

    expect(cabeceras.get('X-Request-Ip')).toBe('203.0.113.77');
    expect(cabeceras.get('X-Request-Usuario-Aplicativo')).toBe('jperez');
    expect(cabeceras.get('X-Request-Pc')).toBe(auditoriaDefault.PC);
    expect(cabeceras.get('X-Request-Mac')).toBe(auditoriaDefault.MAC);
  });

  it('usa el usuario de petición explícito antes de abrir sesión', async () => {
    service.establecerUsuarioPeticion('login-temp');

    const cabeceras = await firstValueFrom(service.obtenerCabecerasHttp());

    expect(cabeceras.get('X-Request-Usuario-Aplicativo')).toBe('login-temp');
    service.limpiarUsuarioPeticion();
  });

  it('construye AuditoriaRequest para el body de operaciones', async () => {
    const auditoria = await firstValueFrom(service.construirAuditoriaRequest('jperez'));

    expect(auditoria).toEqual({
      usuario: 'jperez',
      nombrePc: auditoriaDefault.PC,
      numeroIp: '203.0.113.77',
      direccionMac: auditoriaDefault.MAC,
    });
  });

  it('permite override de PC/MAC vía sessionStorage', async () => {
    sessionStorage.setItem(constantes.AUDITORIA_PC, 'PC-LAB');
    sessionStorage.setItem(constantes.AUDITORIA_MAC, 'aa-bb-cc-dd-ee-ff');

    const cabeceras = await firstValueFrom(service.obtenerCabecerasHttp('jperez'));

    expect(cabeceras.get('X-Request-Pc')).toBe('PC-LAB');
    expect(cabeceras.get('X-Request-Mac')).toBe('aa-bb-cc-dd-ee-ff');
  });
});
