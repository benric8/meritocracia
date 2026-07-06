import { Injectable, inject, OnDestroy } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { mensajes } from '../../../domain/commons/constants';
import {
  enVentanaRenovacion,
  formatearDuracion,
  INTERVALO_CONTADOR_AVISO_MS,
  INTERVALO_MONITOREO_MS,
  segundosRestantesRefresh,
} from '../../../domain/commons/session-timers';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { AuthStore } from '../stores/auth.store';
import { TokenRefreshService } from '../services/token-refresh.service';

/**
 * Orquesta la vigencia de la sesión: validación en guards, monitoreo en segundo plano
 * y avisos al usuario cuando la sesión entra en ventana de renovación.
 */
@Injectable({ providedIn: 'root' })
export class SessionVigenciaService implements OnDestroy {
  private readonly sesion = inject(SESION_PORT);
  private readonly authStore = inject(AuthStore);
  private readonly tokenRefresh = inject(TokenRefreshService);
  private readonly router = inject(Router);

  private intervaloId: ReturnType<typeof setInterval> | null = null;
  private contadorAvisoId: ReturnType<typeof setInterval> | null = null;
  private avisoRenovacionAbierto = false;

  ngOnDestroy(): void {
    this.detenerMonitoreo();
  }

  resolverAccesoZonaPrivada(): boolean | UrlTree {
    if (!this.authStore.autenticado()) {
      return this.router.createUrlTree(['/login']);
    }

    if (this.sesionCompletamenteExpirada()) {
      this.finalizarSesion();
      return this.router.createUrlTree(['/login']);
    }

    return true;
  }

  resolverAccesoLogin(): boolean | UrlTree {
    if (!this.authStore.autenticado()) {
      return true;
    }

    if (this.sesionCompletamenteExpirada()) {
      this.finalizarSesion();
      return true;
    }

    return this.router.createUrlTree(['/inicio']);
  }

  iniciarMonitoreo(): void {
    if (this.intervaloId != null || !this.authStore.autenticado()) {
      return;
    }

    this.intervaloId = setInterval(() => this.evaluarSesionActiva(), INTERVALO_MONITOREO_MS);
  }

  detenerMonitoreo(): void {
    if (this.intervaloId != null) {
      clearInterval(this.intervaloId);
      this.intervaloId = null;
    }
    this.detenerContadorAviso();
    this.avisoRenovacionAbierto = false;
  }

  sesionCompletamenteExpirada(): boolean {
    return !!this.sesion.getToken() && !this.sesion.isVentanaRefreshVigente();
  }

  private evaluarSesionActiva(): void {
    if (!this.authStore.autenticado()) {
      this.detenerMonitoreo();
      return;
    }

    if (this.sesionCompletamenteExpirada()) {
      this.mostrarSesionExpirada();
      return;
    }

    if (this.debeMostrarAvisoRenovacion()) {
      void this.mostrarAvisoRenovacion();
    }
  }

  private debeMostrarAvisoRenovacion(): boolean {
    if (this.avisoRenovacionAbierto || Swal.isVisible()) {
      return false;
    }

    const transcurrido = this.sesion.getSegundosDesdeGeneracion();
    const exps = this.sesion.getExpsSeg();
    const refs = this.sesion.getRefsSeg();

    return enVentanaRenovacion(transcurrido, exps, refs);
  }

  private async mostrarAvisoRenovacion(): Promise<void> {
    this.avisoRenovacionAbierto = true;

    const resultado = await Swal.fire({
      title: 'Atención',
      html: this.mensajeAvisoRenovacion(),
      showDenyButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Continuar en la plataforma',
      denyButtonText: 'Salir',
      didOpen: () => this.iniciarContadorAviso(),
      willClose: () => this.detenerContadorAviso(),
    });

    this.avisoRenovacionAbierto = false;
    this.detenerContadorAviso();

    if (this.sesionCompletamenteExpirada()) {
      await this.mostrarSesionExpirada();
      return;
    }

    if (resultado.isConfirmed) {
      await this.renovarSesion();
      return;
    }

    if (resultado.isDenied) {
      this.finalizarSesion();
      await this.router.navigate(['/login']);
    }
  }

  private mensajeAvisoRenovacion(): string {
    const restante = this.segundosRestantesActuales();
    return `Tu sesión está por finalizar. Tiempo restante: <strong>${formatearDuracion(restante)}</strong>.`;
  }

  private segundosRestantesActuales(): number {
    return segundosRestantesRefresh(
      this.sesion.getSegundosDesdeGeneracion(),
      this.sesion.getExpsSeg(),
      this.sesion.getRefsSeg()
    );
  }

  private iniciarContadorAviso(): void {
    this.detenerContadorAviso();

    this.contadorAvisoId = setInterval(() => {
      if (!Swal.isVisible()) {
        this.detenerContadorAviso();
        return;
      }

      if (this.sesionCompletamenteExpirada()) {
        this.detenerContadorAviso();
        Swal.close();
        return;
      }

      Swal.update({ html: this.mensajeAvisoRenovacion() });
    }, INTERVALO_CONTADOR_AVISO_MS);
  }

  private detenerContadorAviso(): void {
    if (this.contadorAvisoId != null) {
      clearInterval(this.contadorAvisoId);
      this.contadorAvisoId = null;
    }
  }

  private async mostrarSesionExpirada(): Promise<void> {
    this.detenerMonitoreo();

    if (Swal.isVisible()) {
      const titulo = Swal.getTitle()?.textContent;
      if (titulo === mensajes.SWAL_TITLE_TOKEN_EXPIRA) {
        return;
      }
    }

    await Swal.fire({
      title: mensajes.SWAL_TITLE_TOKEN_EXPIRA,
      html: 'El aplicativo se cerrará en este momento.',
      confirmButtonText: 'OK',
      allowOutsideClick: false,
    });

    this.finalizarSesion();
    await this.router.navigate(['/login']);
  }

  private async renovarSesion(): Promise<void> {
    try {
      await firstValueFrom(this.tokenRefresh.refrescarToken());
    } catch {
      await this.mostrarSesionExpirada();
    }
  }

  cerrarSesionManual(): void {
    this.finalizarSesion();
  }

  private finalizarSesion(): void {
    this.detenerMonitoreo();
    this.authStore.cerrarSesion();
  }
}
