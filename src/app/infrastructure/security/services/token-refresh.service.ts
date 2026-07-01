import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, Observable, of, switchMap, take, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { constantes } from '../../../domain/commons/constants';
import { RefreshTokenResponse } from '../../../domain/dto/remote/RefreshTokenResponse.dto';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { authEndpoints } from '../../api/auth-api.constants';
import { AuthStore } from '../stores/auth.store';

/**
 * Coordina el refresh JWT (cola de peticiones) inspirado en web,
 * consolidado en un único servicio reutilizable por el interceptor.
 */
@Injectable({ providedIn: 'root' })
export class TokenRefreshService {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);
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

  refrescarToken(): Observable<string> {
    const tokenActual = this.sesion.getToken();
    if (!tokenActual) {
      return throwError(() => new Error('Sin token para refrescar'));
    }

    if (!this.refreshEnProgreso) {
      this.refreshEnProgreso = true;
      this.refreshSubject.next(null);

      return this.http
        .get<RefreshTokenResponse>(`${environment.urlApi}${authEndpoints.REFRESH}`, {
          params: { token: tokenActual },
        })
        .pipe(
          switchMap((respuesta) => {
            if (respuesta.codigo !== constantes.RES_COD_EXITO || !respuesta.data?.token) {
              return throwError(() => new Error(respuesta.descripcion || 'Refresh rechazado'));
            }
            this.sesion.setToken(respuesta.data.token);
            this.sesion.marcarTokenGenerado();
            this.authStore.actualizarToken(respuesta.data.token);
            this.refreshEnProgreso = false;
            this.refreshSubject.next(respuesta.data.token);
            return of(respuesta.data.token);
          }),
          catchError((error) => {
            this.refreshEnProgreso = false;
            this.cerrarSesionPorExpiracion();
            return throwError(() => error);
          })
        );
    }

    return this.refreshSubject.pipe(
      filter((token): token is string => token !== null),
      take(1)
    );
  }

  cerrarSesionPorExpiracion(): void {
    this.authStore.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
