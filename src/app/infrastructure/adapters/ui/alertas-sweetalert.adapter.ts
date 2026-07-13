import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { AlertaConfirmacion, AlertasPort } from '../../../domain/ports/alertas.port';
import { formatearHtmlDetalleError } from './alerta-error-html.util';

/** Alineado con `temaUi.COLOR_PRIMARIO` / `--mc-primary`. */
const COLOR_CONFIRMAR = '#8b0000';

/**
 * Adaptador de UI: implementa `AlertasPort` con SweetAlert2.
 * Se registra solo vía `{ provide: ALERTAS_PORT, useClass: AlertasSweetAlertAdapter }`.
 */
@Injectable()
export class AlertasSweetAlertAdapter implements AlertasPort {
  private mostrandoError = false;

  async error(titulo: string, detalle: DetalleError): Promise<void> {
    if (this.mostrandoError || Swal.isVisible()) {
      return;
    }

    this.mostrandoError = true;

    try {
      await Swal.fire({
        icon: 'error',
        title: titulo,
        html: formatearHtmlDetalleError(detalle),
        confirmButtonText: 'Aceptar',
        confirmButtonColor: COLOR_CONFIRMAR,
        allowOutsideClick: false,
      });
    } finally {
      this.mostrandoError = false;
    }
  }

  async exito(titulo: string, texto: string): Promise<void> {
    await Swal.fire({
      icon: 'success',
      title: titulo,
      text: texto,
      confirmButtonColor: COLOR_CONFIRMAR,
    });
  }

  async confirmar(opciones: AlertaConfirmacion): Promise<boolean> {
    const resultado: SweetAlertResult = await Swal.fire({
      icon: opciones.icono ?? 'question',
      title: opciones.titulo,
      html: opciones.html,
      showCancelButton: true,
      confirmButtonText: opciones.textoConfirmar ?? 'Confirmar',
      cancelButtonText: opciones.textoCancelar ?? 'Cancelar',
      confirmButtonColor: COLOR_CONFIRMAR,
    });

    return resultado.isConfirmed;
  }
}
