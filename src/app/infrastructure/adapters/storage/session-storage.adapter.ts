import { Injectable, inject } from '@angular/core';
import { constantes } from '../../../domain/commons/constants';
import { MenuOpcion } from '../../../domain/dto/remote/OpcionesResponse.dto';
import { SesionPort } from '../../../domain/ports/sesion.port';
import { SessionFieldCryptoService } from '../../security/encryption/session-field-crypto.service';

/** Adaptador de persistencia de sesión sobre `localStorage`. */
@Injectable({ providedIn: 'root' })
export class SessionStorageAdapter implements SesionPort {
  private readonly crypto = inject(SessionFieldCryptoService);

  getToken(): string | null {
    return localStorage.getItem(constantes.JWT_TOKEN);
  }

  setToken(token: string): void {
    localStorage.setItem(constantes.JWT_TOKEN, token);
  }

  getTokenNivel(): string | null {
    return this.crypto.descifrar(localStorage.getItem(constantes.JWT_TOKEN_NIVEL));
  }

  setTokenNivel(nivel: string): void {
    localStorage.setItem(constantes.JWT_TOKEN_NIVEL, this.crypto.cifrar(nivel));
  }

  setTiemposToken(expsSeg: number, refsSeg: number): void {
    localStorage.setItem(constantes.TOKEN_VALID_SEC, String(expsSeg));
    localStorage.setItem(constantes.REFRESH_TOKEN_VALID_SEC, String(refsSeg));
  }

  marcarTokenGenerado(fecha: Date = new Date()): void {
    localStorage.setItem(constantes.DATETIME_NEW_TOKEN, String(fecha.getTime()));
  }

  getSegundosDesdeGeneracion(): number {
    const generadoEn = localStorage.getItem(constantes.DATETIME_NEW_TOKEN);
    if (!generadoEn) {
      return -1;
    }
    const generadoMs = Number(generadoEn);
    if (!generadoMs) {
      return -1;
    }
    return Math.floor((Date.now() - generadoMs) / 1000);
  }

  getExpsSeg(): number {
    const exps = localStorage.getItem(constantes.TOKEN_VALID_SEC);
    return exps ? Number(exps) : -1;
  }

  getRefsSeg(): number {
    const refs = localStorage.getItem(constantes.REFRESH_TOKEN_VALID_SEC);
    return refs ? Number(refs) : -1;
  }

  isTokenVigente(margenSeg = 5): boolean {
    const transcurrido = this.getSegundosDesdeGeneracion();
    const exps = this.getExpsSeg();
    if (transcurrido < 0 || exps < 0) {
      return false;
    }
    return transcurrido < exps - margenSeg;
  }

  isVentanaRefreshVigente(): boolean {
    const transcurrido = this.getSegundosDesdeGeneracion();
    const exps = this.getExpsSeg();
    const refs = this.getRefsSeg();
    if (transcurrido < 0 || exps < 0 || refs < 0) {
      return false;
    }
    return transcurrido < exps + refs;
  }

  getUsuarioCodigo(): string | null {
    return this.crypto.descifrar(localStorage.getItem(constantes.USUARIO_CODIGO));
  }

  setUsuarioCodigo(codigo: string): void {
    localStorage.setItem(constantes.USUARIO_CODIGO, this.crypto.cifrar(codigo));
  }

  getNombreCompleto(): string | null {
    return this.crypto.descifrar(localStorage.getItem(constantes.USUARIO));
  }

  setNombreCompleto(nombre: string): void {
    localStorage.setItem(constantes.USUARIO, this.crypto.cifrar(nombre));
  }

  getPerfilAlmacenado(): string | null {
    return localStorage.getItem(constantes.USUARIO_PERFIL);
  }

  setPerfilAlmacenado(perfil: string): void {
    localStorage.setItem(constantes.USUARIO_PERFIL, perfil);
  }

  getOpciones(): MenuOpcion[] {
    try {
      const crudo = localStorage.getItem(constantes.USUARIO_OPCIONES);
      return crudo ? (JSON.parse(crudo) as MenuOpcion[]) : [];
    } catch {
      return [];
    }
  }

  setOpciones(opciones: MenuOpcion[]): void {
    localStorage.setItem(constantes.USUARIO_OPCIONES, JSON.stringify(opciones));
  }

  limpiarSesion(): void {
    localStorage.removeItem(constantes.JWT_TOKEN);
    localStorage.removeItem(constantes.JWT_TOKEN_NIVEL);
    localStorage.removeItem(constantes.TOKEN_VALID_SEC);
    localStorage.removeItem(constantes.REFRESH_TOKEN_VALID_SEC);
    localStorage.removeItem(constantes.DATETIME_NEW_TOKEN);
    localStorage.removeItem(constantes.USUARIO_CODIGO);
    localStorage.removeItem(constantes.USUARIO);
    localStorage.removeItem(constantes.USUARIO_PERFIL);
    localStorage.removeItem(constantes.USUARIO_OPCIONES);
  }
}
