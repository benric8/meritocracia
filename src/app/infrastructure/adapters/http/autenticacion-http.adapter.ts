import { HttpClient, HttpHeaders } from '@angular/common/http';

import { inject, Injectable } from '@angular/core';

import { Observable, finalize, of, switchMap, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { constantes, tokenNiveles } from '../../../domain/commons/constants';

import { AutenticacionPort } from '../../../domain/ports/autenticacion.port';

import { SESION_PORT } from '../../../domain/ports/sesion.port';

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

  private readonly sesion = inject(SESION_PORT);

  private readonly baseUrl = environment.urlApi;



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

    if (!this.sesion.getToken() || this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_AUTH) {

      return false;

    }

    return this.sesion.isTokenVigente();

  }



  login(usuario: string, clave: string, aplicaCaptcha: string = constantes.INDICADOR_NO): Observable<LoginResponse> {

    const body = { usuario, clave, aplicaCaptcha };



    return this.asegurarTokenBasico().pipe(

      switchMap(() => {

        this.auditoriaContext.establecerUsuarioPeticion(usuario);

        return this.http.post<LoginResponse>(`${this.baseUrl}${authEndpoints.LOGIN}`, body).pipe(

          finalize(() => this.auditoriaContext.limpiarUsuarioPeticion())

        );

      }),

      tap((respuesta) => this.persistirTokenLogin(respuesta))

    );

  }



  opciones(usuario: string, idPerfil: number): Observable<OpcionesResponse> {

    const body = { usuario, idPerfil };



    this.auditoriaContext.establecerUsuarioPeticion(usuario);

    return this.http.post<OpcionesResponse>(`${this.baseUrl}${authEndpoints.OPCIONES}`, body).pipe(

      tap((respuesta) => this.persistirTokenOpciones(respuesta)),

      finalize(() => this.auditoriaContext.limpiarUsuarioPeticion())

    );

  }



  private persistirTokenBasico(respuesta: tokenResponse): void {

    this.sesion.setToken(respuesta.token);

    this.sesion.setTokenNivel(tokenNiveles.NIVEL_AUTH);

    this.sesion.setTiemposToken(respuesta.exps, respuesta.refs);

    this.sesion.marcarTokenGenerado();

  }



  private persistirTokenLogin(respuesta: LoginResponse): void {

    if (respuesta?.codigo !== constantes.RES_COD_EXITO || !respuesta.data?.token) {

      return;

    }

    this.sesion.setToken(respuesta.data.token);

    this.sesion.setTokenNivel(tokenNiveles.NIVEL_LOGIN);

    this.sesion.marcarTokenGenerado();

  }



  private persistirTokenOpciones(respuesta: OpcionesResponse): void {

    if (respuesta?.codigo !== constantes.RES_COD_EXITO || !respuesta.data?.token) {

      return;

    }

    this.sesion.setToken(respuesta.data.token);

    this.sesion.setTokenNivel(tokenNiveles.NIVEL_OPCIONES);

    this.sesion.setOpciones(respuesta.data.opciones);

    this.sesion.marcarTokenGenerado();

  }

}


