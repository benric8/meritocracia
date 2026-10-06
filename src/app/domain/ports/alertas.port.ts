import { InjectionToken } from '@angular/core';
import { DetalleError } from '../models/detalle-error.model';

/** Iconos de alerta independientes de la librería UI. */
export type IconoAlerta = 'success' | 'error' | 'warning' | 'info' | 'question';

export interface AlertaConfirmacion {
  titulo: string;
  html: string;
  icono?: IconoAlerta;
  textoConfirmar?: string;
  textoCancelar?: string;
}

/**
 * Puerto de salida: notificaciones al usuario (errores, éxitos y confirmaciones).
 * Desacopla interceptors/presentation de SweetAlert u otra librería concreta.
 */
export interface AlertasPort {
  error(titulo: string, detalle: DetalleError): Promise<void>;
  exito(titulo: string, texto: string): Promise<void>;
  confirmar(opciones: AlertaConfirmacion): Promise<boolean>;
}

export const ALERTAS_PORT = new InjectionToken<AlertasPort>('ALERTAS_PORT');
