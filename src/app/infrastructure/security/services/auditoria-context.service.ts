import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { auditoriaDefault, constantes } from '../../../domain/commons/constants';

export interface CabecerasAuditoria {
  usuarioAplicativo: string;
  usuarioRed: string;
  ip: string;
  pc: string;
  mac: string;
}

/** 
 * Resuelve las cabeceras X-Request-* de auditoría para cada petición autenticada.
 *
 * Importante (limitación del navegador):
 * - La IP pública, el nombre del equipo (PC) y la MAC NO son accesibles de forma
 *   fiable desde un navegador. Lo correcto es que el BACKEND los capture desde la
 *   conexión entrante (RemoteAddr / X-Forwarded-For). Por eso este servicio NO
 *   hace llamadas a servicios externos (evita errores de CORS/preflight y la red
 *   corporativa cerrada).
 * - Lo único confiable desde el front es el usuario de sesión.
 * - IP/PC/MAC usan valores constantes por defecto (auditoriaDefault), con
 *   posibilidad de override vía `sessionStorage` si el entorno los inyecta.
 */
@Injectable({ providedIn: 'root' })
export class AuditoriaContextService {
  obtenerCabecerasHttp(usuarioSesion: string): Observable<HttpHeaders> {
    return of(this.aHttpHeaders(this.construirContexto(usuarioSesion)));
  }

  private construirContexto(usuarioSesion: string): CabecerasAuditoria {
    return {
      usuarioAplicativo: usuarioSesion,
      usuarioRed: usuarioSesion,
      ip: sessionStorage.getItem(constantes.AUDITORIA_IP) ?? auditoriaDefault.IP,
      pc: sessionStorage.getItem(constantes.AUDITORIA_PC) ?? auditoriaDefault.PC,
      mac: sessionStorage.getItem(constantes.AUDITORIA_MAC) ?? auditoriaDefault.MAC,
    };
  }

  private aHttpHeaders(ctx: CabecerasAuditoria): HttpHeaders {
    return new HttpHeaders({
      'X-Request-Usuario-Aplicativo': ctx.usuarioAplicativo,
      'X-Request-Usuario-Red': ctx.usuarioRed,
      'X-Request-Ip': ctx.ip,
      'X-Request-Pc': ctx.pc,
      'X-Request-Mac': ctx.mac,
    });
  }
}
