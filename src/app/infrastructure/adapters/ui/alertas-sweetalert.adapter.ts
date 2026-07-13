import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { AlertaConfirmacion, AlertasPort } from '../../../domain/ports/alertas.port';

/** Alineado con `temaUi.COLOR_PRIMARIO` / `--mc-primary`. */
const COLOR_CONFIRMAR = '#8b0000';

/**
 * Adaptador de UI: implementa `AlertasPort` con SweetAlert2.
 */
@Injectable({ providedIn: 'root' })
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
        html: this.construirHtmlError(detalle),
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

  private construirHtmlError(detalle: DetalleError): string {
    const mensaje = this.escaparHtml(detalle.mensaje);
    const codigoOperacion = detalle.codigoOperacion?.trim();

    if (!codigoOperacion) {
      return mensaje;
    }

    return `${mensaje}<br><br><small><strong>Código de operación:</strong> ${this.escaparHtml(codigoOperacion)}</small>`;
  }

  private escaparHtml(valor: string): string {
    return valor
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
