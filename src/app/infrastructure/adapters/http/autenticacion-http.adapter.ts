import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { constantes, tokenNiveles } from '../../../domain/commons/constants';
import { AutenticacionPort } from '../../../domain/ports/autenticacion.port';
import { Util } from '../../../domain/commons/util';
import { LoginResponse } from '../../../domain/dto/remote/LoginResponse.dto';
import { OpcionesResponse } from '../../../domain/dto/remote/OpcionesResponse.dto';
import { tokenResponse } from '../../../domain/dto/remote/tokenResponse.dto';
import { authEndpoints } from '../../api/auth-api.constants';
import { AuditoriaContextService } from '../../security/services/auditoria-context.service';

/**
 * Adaptador HTTP de salida: implementa AutenticacionPort contra el backend Spring Boot.
 */
@Injectable({ providedIn: 'root' })
export class AutenticacionHttpAdapter implements AutenticacionPort {
  private readonly http = inject(HttpClient);
  private readonly auditoriaContext = inject(AuditoriaContextService);
  private readonly baseUrl = environment.urlApi;
  private readonly margenExpiracionMs = 5000;

  generarTokenBasico(): Observable<tokenResponse> {
    const headers = new HttpHeaders({
      username: Util.v5,
      password: Util.v6,
      codigoRol: Util.v4,
    });

    return this.http
      .post<tokenResponse>(`${this.baseUrl}${authEndpoints.TOKEN_BASICO}`, null, { headers })
      .pipe(tap((respuesta) => this.persistirTokenBasico(respuesta)));
  }

  asegurarTokenBasico(): Observable<unknown> {
    return this.tokenBasicoVigente() ? of(null) : this.generarTokenBasico();
  }

  tokenBasicoVigente(): boolean {
    const token = localStorage.getItem(constantes.JWT_TOKEN);
    const nivel = localStorage.getItem(constantes.JWT_TOKEN_NIVEL);
    if (!token || nivel !== tokenNiveles.NIVEL_AUTH) {
      return false;
    }

    const expsSeg = Number(localStorage.getItem(constantes.TOKEN_VALID_SEC));
    const generadoEnMs = Number(localStorage.getItem(constantes.DATETIME_NEW_TOKEN));
    if (!expsSeg || !generadoEnMs) {
      return false;
    }

    return Date.now() < generadoEnMs + expsSeg * 1000 - this.margenExpiracionMs;
  }

  login(usuario: string, clave: string, aplicaCaptcha: string = constantes.INDICADOR_NO): Observable<LoginResponse> {
    const body = { usuario, clave, aplicaCaptcha };

    return this.asegurarTokenBasico().pipe(
      switchMap(() => this.auditoriaContext.obtenerCabecerasHttp(usuario)),
      switchMap((headers) =>
        this.http.post<LoginResponse>(`${this.baseUrl}${authEndpoints.LOGIN}`, body, { headers })
      ),
      tap((respuesta) => this.persistirTokenLogin(respuesta))
    );
  }

  opciones(usuario: string, idPerfil: number): Observable<OpcionesResponse> {
    const body = { usuario, idPerfil };

    return this.auditoriaContext.obtenerCabecerasHttp(usuario).pipe(
      switchMap((headers) =>
        this.http.post<OpcionesResponse>(`${this.baseUrl}${authEndpoints.OPCIONES}`, body, { headers })
      ),
      tap((respuesta) => this.persistirTokenOpciones(respuesta))
    );
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
