import { HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, Observable, of, switchMap, take, throwError } from 'rxjs';
import { getAppConfig } from '../../config/app-runtime-config';
import { auditoriaDefault } from '../../../domain/commons/constants';
import { RefreshTokenResponse } from '../../dto/remote/RefreshTokenResponse.dto';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { esCodigoExito } from '../../api/api-response.util';
import { authEndpoints } from '../../api/auth-api.constants';
import { AuditoriaContextService } from './auditoria-context.service';
import { AuthStore } from '../stores/auth.store';

/**
 * Coordina el refresh JWT (cola de peticiones) inspirado en web,
 * consolidado en un único servicio reutilizable por el interceptor.
 */
@Injectable({ providedIn: 'root' })
export class TokenRefreshService {
  private readonly httpDirecto = new HttpClient(inject(HttpBackend));
  private readonly sesion = inject(SESION_PORT);
  private readonly auditoria = inject(AuditoriaContextService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  private refreshEnProgreso = false;
  private readonly refreshSubject = new BehaviorSubject<string | null>(null);

  debeRefrescar(): boolean {
    return !!this.sesion.getToken() && !this.sesion.isTokenVigente();
  }

  ventanaRefreshExpirada(): boolean {
    return !!this.sesion.getToken() && !this.sesion.isVentanaRefreshVigente();
  }

  /** Renovación explícita desde el diálogo de sesión (sin interceptor de sesión). */
  refrescarSesionUsuario(): Observable<string> {
    return this.ejecutarRefreshHttp();
  }

  refrescarToken(): Observable<string> {
    const tokenActual = this.sesion.getToken();
    if (!tokenActual) {
      return throwError(() => new Error('Sin token para refrescar'));
    }

    if (!this.refreshEnProgreso) {
      this.refreshEnProgreso = true;
      this.refreshSubject.next(null);

      return this.ejecutarRefreshHttp().pipe(
        switchMap((nuevoToken) => {
          this.refreshEnProgreso = false;
          this.refreshSubject.next(nuevoToken);
          return of(nuevoToken);
        }),
        catchError((error) => {
          this.refreshEnProgreso = false;
          return throwError(() => error);
        })
      );
    }

    return this.refreshSubject.pipe(
      filter((token): token is string => !!token),
      take(1)
    );
  }

  cerrarSesionPorExpiracion(): void {
    this.authStore.cerrarSesion();
    void this.router.navigate(['/login']);
  }

  private ejecutarRefreshHttp(): Observable<string> {
    const tokenActual = this.sesion.getToken();
    if (!tokenActual) {
      return throwError(() => new Error('Sin token para refrescar'));
    }

    const url = `${getAppConfig().urlApi}${authEndpoints.REFRESH}?token=${encodeURIComponent(tokenActual)}`;
    const usuario = this.sesion.getUsuarioCodigo() ?? 'SISTEMA';

    return this.auditoria.obtenerCabecerasHttp(usuario).pipe(
      switchMap((cabeceras) => this.llamarRefresh(url, tokenActual, cabeceras)),
      catchError(() =>
        this.llamarRefresh(url, tokenActual, this.cabecerasAuditoriaRespaldo(usuario))
      )
    );
  }

  private llamarRefresh(
    url: string,
    tokenActual: string,
    cabecerasAuditoria: HttpHeaders
  ): Observable<string> {
    const headers = cabecerasAuditoria.set('Authorization', `Bearer ${tokenActual}`);

    return this.httpDirecto.get<RefreshTokenResponse>(url, { headers }).pipe(
      switchMap((respuesta) => {
        const nuevoToken = this.extraerTokenDeRespuesta(respuesta);
        if (!esCodigoExito(respuesta?.codigo) || !nuevoToken) {
          const mensaje = respuesta?.descripcion ?? 'Refresh rechazado por el servidor';
          return throwError(() => new Error(mensaje));
        }

        this.sesion.setToken(nuevoToken);
        this.sesion.marcarTokenGenerado();
        this.authStore.actualizarToken(nuevoToken);
        return of(nuevoToken);
      }),
      catchError((error: unknown) => this.normalizarErrorRefresh(error))
    );
  }

  private cabecerasAuditoriaRespaldo(usuario: string): HttpHeaders {
    return new HttpHeaders({
      'X-Request-Usuario-Aplicativo': usuario,
      'X-Request-Usuario-Red': usuario,
      'X-Request-Ip': auditoriaDefault.IP,
      'X-Request-Pc': auditoriaDefault.PC,
      'X-Request-Mac': auditoriaDefault.MAC,
    });
  }

  private normalizarErrorRefresh(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      const cuerpo = error.error as
        | { descripcion?: string; message?: string; codigo?: string }
        | string
        | null;

      if (typeof cuerpo === 'string' && cuerpo.trim()) {
        return throwError(() => new Error(cuerpo));
      }

      if (cuerpo && typeof cuerpo === 'object') {
        const mensaje = cuerpo.descripcion ?? cuerpo.message;
        if (mensaje) {
          return throwError(() => new Error(mensaje));
        }
      }

      return throwError(() => new Error(`No se pudo renovar la sesión (HTTP ${error.status}).`));
    }

    if (error instanceof Error) {
      return throwError(() => error);
    }

    return throwError(() => new Error('No se pudo renovar la sesión.'));
  }

  private extraerTokenDeRespuesta(respuesta: RefreshTokenResponse): string | null {
    const tokenDirecto = respuesta?.data?.token;
    if (tokenDirecto) {
      return tokenDirecto;
    }

    const tokenAlternativo = (respuesta as { token?: string }).token;
    return tokenAlternativo ?? null;
  }
}
