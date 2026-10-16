import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { PeticionPaginada, ResultadoPaginado } from '../models/paginacion.model';
import {
  FichaSuplencia,
  FiltrosSuplencias,
  MotivoSuplencia,
  RegistradorSuplente,
  SuplenciaAsignada,
} from '../models/suplencia.model';

/**
 * Puerto de salida: asignación de registrador suplente (solo Administrador).
 */
export interface SuplenciasPort {
  listar(
    filtros: FiltrosSuplencias,
    paginacion: PeticionPaginada
  ): Observable<ResultadoPaginado<FichaSuplencia>>;

  listarRegistradores(): Observable<RegistradorSuplente[]>;

  listarMotivos(): Observable<MotivoSuplencia[]>;

  /** Asigna o cambia el suplente de la ficha. */
  asignar(fichaId: string, registradorSuplenteId: number, motivo: string): Observable<SuplenciaAsignada>;

  retirar(fichaId: string): Observable<void>;
}

export const SUPLENCIAS_PORT = new InjectionToken<SuplenciasPort>('SUPLENCIAS_PORT');
