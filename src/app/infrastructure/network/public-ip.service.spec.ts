import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { auditoriaDefault, constantes } from '../../domain/commons/constants';
import { PublicIpService } from './public-ip.service';

describe('PublicIpService', () => {
  let service: PublicIpService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sessionStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicIpService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('devuelve la IP almacenada en sessionStorage sin llamar a servicios externos', async () => {
    sessionStorage.setItem(constantes.AUDITORIA_IP, '203.0.113.10');

    const ip = await firstValueFrom(service.obtenerIpPublica());

    expect(ip).toBe('203.0.113.10');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('obtiene la IP desde ipify y la persiste en sessionStorage', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('ipify')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ip: '198.51.100.20' }),
        });
      }
      return Promise.reject(new Error('cloudflare no disponible'));
    });

    const ip = await firstValueFrom(service.obtenerIpPublica());

    expect(ip).toBe('198.51.100.20');
    expect(sessionStorage.getItem(constantes.AUDITORIA_IP)).toBe('198.51.100.20');
  });

  it('usa auditoriaDefault.IP cuando ningún servicio responde', async () => {
    fetchMock.mockRejectedValue(new Error('sin red'));

    const ip = await firstValueFrom(service.obtenerIpPublica());

    expect(ip).toBe(auditoriaDefault.IP);
    expect(sessionStorage.getItem(constantes.AUDITORIA_IP)).toBe(auditoriaDefault.IP);
  });

  it('no vuelve a consultar servicios externos tras cachear en sessionStorage', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('ipify')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ip: '203.0.113.55' }),
        });
      }
      return Promise.reject(new Error('cloudflare no disponible'));
    });

    await firstValueFrom(service.obtenerIpPublica());
    const llamadasTrasPrimera = fetchMock.mock.calls.length;

    await firstValueFrom(service.obtenerIpPublica());

    expect(fetchMock.mock.calls.length).toBe(llamadasTrasPrimera);
  });
});
