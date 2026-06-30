import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginResponse } from '../dto/remote/LoginResponse.dto';
import { OpcionesResponse } from '../dto/remote/OpcionesResponse.dto';
import { tokenResponse } from '../dto/remote/tokenResponse.dto';

/**
 * Puerto de salida (hexagonal): contrato de autenticación que el dominio
 * y los casos de uso consumen sin conocer HTTP ni localStorage.
 */
export interface AutenticacionPort {
  generarTokenBasico(): Observable<tokenResponse>;
  asegurarTokenBasico(): Observable<unknown>;
  tokenBasicoVigente(): boolean;
  login(usuario: string, clave: string, aplicaCaptcha?: string): Observable<LoginResponse>;
  opciones(usuario: string, idPerfil: number): Observable<OpcionesResponse>;
}

export const AUTENTICACION_PORT = new InjectionToken<AutenticacionPort>('AUTENTICACION_PORT');
