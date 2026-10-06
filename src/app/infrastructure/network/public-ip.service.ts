import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { auditoriaDefault, constantes } from '../../domain/commons/constants';

/**
 * Obtiene la IP pública WAN del cliente (Cloudflare → ipify) y la cachea en sessionStorage.
 * Inspirado en meritocracia-web `UtilsNetwork`, adaptado a la arquitectura de web21.
 */
@Injectable({ providedIn: 'root' })
export class PublicIpService {
  private readonly cloudflareFallbackUrls = [
    'https://one.one.one.one/cdn-cgi/trace',
    'https://1.0.0.1/cdn-cgi/trace',
    'https://cloudflare-dns.com/cdn-cgi/trace',
    'https://cloudflare-eth.com/cdn-cgi/trace',
    'https://workers.dev/cdn-cgi/trace',
    'https://pages.dev/cdn-cgi/trace',
    'https://cloudflare.tv/cdn-cgi/trace',
    'https://icanhazip.com/cdn-cgi/trace',
  ];

  private cachedIp$: Observable<string> | null = null;

  /** Devuelve la IP pública cacheada o la resuelve una sola vez por sesión de pestaña. */
  obtenerIpPublica(): Observable<string> {
    const almacenada = sessionStorage.getItem(constantes.AUDITORIA_IP);
    if (almacenada) {
      return of(almacenada);
    }

    if (!this.cachedIp$) {
      this.cachedIp$ = this.resolverIpPublica().pipe(shareReplay(1));
    }

    return this.cachedIp$;
  }

  limpiarCache(): void {
    this.cachedIp$ = null;
    sessionStorage.removeItem(constantes.AUDITORIA_IP);
  }

  private resolverIpPublica(): Observable<string> {
    return from(this.obtenerIpDesdeServicios()).pipe(
      map((ip) => ip ?? auditoriaDefault.IP),
      tap((ip) => sessionStorage.setItem(constantes.AUDITORIA_IP, ip)),
      catchError(() => {
        const fallback = auditoriaDefault.IP;
        sessionStorage.setItem(constantes.AUDITORIA_IP, fallback);
        return of(fallback);
      })
    );
  }

  private async obtenerIpDesdeServicios(): Promise<string | null> {
    const cloudflareIp = await this.obtenerIpCloudflare();
    if (cloudflareIp) {
      return cloudflareIp;
    }

    return this.obtenerIpIpify();
  }

  private async obtenerIpCloudflare(): Promise<string | null> {
    try {
      const data = await this.obtenerJsonCloudflare();
      return data?.['ip'] ?? null;
    } catch {
      return null;
    }
  }

  private async obtenerIpIpify(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
      if (!response.ok) {
        return null;
      }
      const data = (await response.json()) as { ip?: string };
      return data?.ip ?? null;
    } catch {
      return null;
    }
  }

  private async obtenerJsonCloudflare(): Promise<Record<string, string> | null> {
    const text = await this.fetchConFallback(this.cloudflareFallbackUrls);
    if (!text) {
      return null;
    }

    const entries = text
      .trim()
      .split('\n')
      .map((line) => line.split('='))
      .filter((parts) => parts.length === 2) as [string, string][];

    return Object.fromEntries(entries);
  }

  private async fetchConFallback(urls: string[]): Promise<string | null> {
    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) {
          return await response.text();
        }
      } catch {
        // Intenta la siguiente URL de respaldo.
      }
    }
    return null;
  }
}
