import { HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { auditoriaDefault, constantes } from '../../../domain/commons/constants';
import { AuditoriaRequest } from '../../dto/remote/AuditoriaRequest.dto';
import { PublicIpService } from '../../network/public-ip.service';
import { SESION_PORT } from '../../../domain/ports/sesion.port';

export interface CabecerasAuditoria {
  usuarioAplicativo: string;
  usuarioRed: string;
  ip: string;
  pc: string;
  mac: string;
}

/**
 * Resuelve las cabeceras X-Request-* de auditoría (RNF005) para cada petición autenticada.
 * La IP pública se obtiene vía `PublicIpService` (Cloudflare/ipify) con fallback a constantes.
 * PC/MAC siguen usando valores por defecto u override en sessionStorage.
 */
@Injectable({ providedIn: 'root' })
export class AuditoriaContextService {
  private readonly sesion = inject(SESION_PORT);
  private readonly publicIp = inject(PublicIpService);
  /** Usuario explícito para la siguiente petición (p. ej. login antes de abrir sesión). */
  private usuarioPeticion: string | null = null;

  establecerUsuarioPeticion(usuario: string): void {
    this.usuarioPeticion = usuario;
  }

  limpiarUsuarioPeticion(): void {
    this.usuarioPeticion = null;
  }

  obtenerCabecerasHttp(usuarioSesion?: string): Observable<HttpHeaders> {
    const usuario = usuarioSesion ?? this.usuarioPeticion ?? this.sesion.getUsuarioCodigo() ?? 'SISTEMA';
    return this.publicIp.obtenerIpPublica().pipe(
      map((ip) => this.aHttpHeaders(this.construirContexto(usuario, ip)))
    );
  }

  construirAuditoriaRequest(usuarioSesion?: string): Observable<AuditoriaRequest> {
    const usuario = usuarioSesion ?? this.usuarioPeticion ?? this.sesion.getUsuarioCodigo() ?? 'SISTEMA';
    return this.publicIp.obtenerIpPublica().pipe(
      map((ip) => {
        const ctx = this.construirContexto(usuario, ip);
        return {
          usuario: ctx.usuarioAplicativo,
          nombrePc: ctx.pc,
          numeroIp: ctx.ip,
          direccionMac: ctx.mac,
        };
      })
    );
  }

  private construirContexto(usuarioSesion: string, ipPublica: string): CabecerasAuditoria {
    return {
      usuarioAplicativo: usuarioSesion,
      usuarioRed: usuarioSesion,
      ip: ipPublica,
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
