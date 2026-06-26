import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { constantes, endpoints, tokenNiveles } from '../../../domain/commons/constants';
import { Util } from '../../../domain/commons/util';
import { LoginResponse } from '../../../domain/dto/remote/LoginResponse.dto';
import { OpcionesResponse } from '../../../domain/dto/remote/OpcionesResponse.dto';
import { tokenResponse } from '../../../domain/dto/remote/tokenResponse.dto';
import { AuditoriaContextService } from './auditoria-context.service';

/**
 * Servicio de autenticación (adaptador de salida HTTP).
 *
 * Tres niveles de token:
 *  - NIVEL_AUTH     -> handshake (api/authenticate)
 *  - NIVEL_LOGIN    -> login usuario/clave
 *  - NIVEL_OPCIONES -> menú y permisos por perfil
 */
@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  private readonly http = inject(HttpClient);
  private readonly auditoriaContext = inject(AuditoriaContextService);
  private readonly baseUrl = environment.urlApi;

  generarTokenBasico(): Observable<tokenResponse> {
    const headers = new HttpHeaders({
      username: Util.v5,
      password: Util.v6,
      codigoRol: Util.v4,
    });

    return this.http
      .post<tokenResponse>(`${this.baseUrl}${endpoints.TOKEN_BASICO}`, null, { headers })
      .pipe(tap((respuesta) => this.persistirTokenBasico(respuesta)));
  }

  login(usuario: string, clave: string, aplicaCaptcha: string = constantes.INDICADOR_NO): Observable<LoginResponse> {
    const body = { usuario, clave, aplicaCaptcha };

    return this.auditoriaContext.obtenerCabecerasHttp(usuario).pipe(
      switchMap((headers) =>
        this.http.post<LoginResponse>(`${this.baseUrl}${endpoints.LOGIN}`, body, { headers })
      ),
      tap((respuesta) => this.persistirTokenLogin(respuesta))
    );
  }

  opciones(usuario: string, idPerfil: number): Observable<OpcionesResponse> {
    const body = { usuario, idPerfil };

    return this.auditoriaContext.obtenerCabecerasHttp(usuario).pipe(
      switchMap((headers) =>
        this.http.post<OpcionesResponse>(`${this.baseUrl}${endpoints.OPCIONES}`, body, { headers })
      ),
      tap((respuesta) => this.persistirTokenOpciones(respuesta))
    );
  }

  autenticar(usuario: string, clave: string): Observable<LoginResponse> {
    return this.generarTokenBasico().pipe(switchMap(() => this.login(usuario, clave)));
  }

  private persistirTokenBasico(respuesta: tokenResponse): void {
    localStorage.setItem(constantes.JWT_TOKEN, respuesta.token);
    localStorage.setItem(constantes.JWT_TOKEN_NIVEL, tokenNiveles.NIVEL_AUTH);
    localStorage.setItem(constantes.TOKEN_VALID_SEC, String(respuesta.exps));
    localStorage.setItem(constantes.REFRESH_TOKEN_VALID_SEC, String(respuesta.refs));
    localStorage.setItem(constantes.DATETIME_NEW_TOKEN, String(Date.now()));
  }

  private persistirTokenLogin(respuesta: LoginResponse): void {
    if (respuesta?.codigo !== constantes.RES_COD_EXITO || !respuesta.data?.token) {
      return;
    }
    localStorage.setItem(constantes.JWT_TOKEN, respuesta.data.token);
    localStorage.setItem(constantes.JWT_TOKEN_NIVEL, tokenNiveles.NIVEL_LOGIN);
    localStorage.setItem(constantes.DATETIME_NEW_TOKEN, String(Date.now()));
  }

  private persistirTokenOpciones(respuesta: OpcionesResponse): void {
    if (respuesta?.codigo !== constantes.RES_COD_EXITO || !respuesta.data?.token) {
      return;
    }
    localStorage.setItem(constantes.JWT_TOKEN, respuesta.data.token);
    localStorage.setItem(constantes.JWT_TOKEN_NIVEL, tokenNiveles.NIVEL_OPCIONES);
    localStorage.setItem(constantes.USUARIO_OPCIONES, JSON.stringify(respuesta.data.opciones));
    localStorage.setItem(constantes.DATETIME_NEW_TOKEN, String(Date.now()));
    if (respuesta.data.rol) {
      localStorage.setItem(constantes.USUARIO_PERFIL, respuesta.data.rol);
    }
  }
}
