import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { DetalleErrorApi } from './api-error.model';

@Injectable({ providedIn: 'root' })
export class ApiErrorModalService {
  private mostrando = false;

  async mostrar(detalle: DetalleErrorApi): Promise<void> {
    if (this.mostrando || Swal.isVisible()) {
      return;
    }

    this.mostrando = true;

    try {
      await Swal.fire({
        title: 'Atención',
        html: this.construirHtml(detalle),
        icon: 'error',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
      });
    } finally {
      this.mostrando = false;
    }
  }

  private construirHtml(detalle: DetalleErrorApi): string {
    const codigoOperacion = detalle.codigoOperacion?.trim();

    if (!codigoOperacion) {
      return detalle.mensaje;
    }

    return `${detalle.mensaje}<br><br><small>Código de operación: <strong>${codigoOperacion}</strong></small>`;
  }
}
