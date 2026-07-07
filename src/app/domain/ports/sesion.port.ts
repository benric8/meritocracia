import { InjectionToken } from '@angular/core';
import { MenuOpcion } from '../../infrastructure/dto/remote/OpcionesResponse.dto';

/**
 * Puerto de persistencia de sesión (tokens, tiempos y datos de usuario).
 * Desacopla use-cases/adapters del mecanismo concreto (localStorage).
 */
export interface SesionPort {
  getToken(): string | null;
  setToken(token: string): void;

  getTokenNivel(): string | null;
  setTokenNivel(nivel: string): void;

  setTiemposToken(expsSeg: number, refsSeg: number): void;
  marcarTokenGenerado(fecha?: Date): void;

  /** Segundos transcurridos desde la última generación/refresh del token. */
  getSegundosDesdeGeneracion(): number;
  getExpsSeg(): number;
  getRefsSeg(): number;

  /** Token dentro de su ventana `exps` (menos margen de seguridad). */
  isTokenVigente(margenSeg?: number): boolean;
  /** Token aún renovable dentro de `exps + refs`. */
  isVentanaRefreshVigente(): boolean;

  getUsuarioCodigo(): string | null;
  setUsuarioCodigo(codigo: string): void;
  getNombreCompleto(): string | null;
  setNombreCompleto(nombre: string): void;
  getPerfilAlmacenado(): string | null;
  setPerfilAlmacenado(perfil: string): void;
  getIdPerfilAlmacenado(): number | null;
  setIdPerfilAlmacenado(idPerfil: number): void;
  getOpciones(): MenuOpcion[];
  setOpciones(opciones: MenuOpcion[]): void;

  limpiarSesion(): void;
}

export const SESION_PORT = new InjectionToken<SesionPort>('SESION_PORT');
