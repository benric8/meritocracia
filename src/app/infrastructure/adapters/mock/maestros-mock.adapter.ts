import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { NivelTitular } from '../../../domain/models/nivel-titular.model';
import { MaestrosPort } from '../../../domain/ports/maestros.port';

const LATENCIA_MS = 300;

@Injectable({ providedIn: 'root' })
export class MaestrosMockAdapter implements MaestrosPort {
  listarNivelesTitular(): Observable<NivelTitular[]> {
    return of(this.nivelesTitular()).pipe(delay(LATENCIA_MS));
  }

  listarDistritosJudiciales(): Observable<CatalogoItem[]> {
    return of([
      { id: '1', nombre: 'CORTE SUPERIOR DE JUSTICIA DE AMAZONAS' },
      { id: '2', nombre: 'CORTE SUPERIOR DE JUSTICIA DE LIMA' },
      { id: '3', nombre: 'CORTE SUPERIOR DE JUSTICIA DE AREQUIPA' },
    ]).pipe(delay(LATENCIA_MS));
  }

  listarCargosTitular(cargoMagistradoId: string): Observable<CatalogoItem[]> {
    const id = cargoMagistradoId?.trim() ?? '';
    if (!id) {
      return of([]).pipe(delay(LATENCIA_MS));
    }

    const cargo =
      this.cargosTitularTodos().find((c) => c.id === id) ??
      this.cargosTitularTodos().find((c) => c.nivelId === id);

    return of(cargo ? [cargo] : []).pipe(delay(LATENCIA_MS));
  }

  listarCargosProvisional(cargoMagistradoId: string): Observable<CatalogoItem[]> {
    const id = cargoMagistradoId?.trim() ?? '';
    if (!id) {
      return of([]).pipe(delay(LATENCIA_MS));
    }

    const cargo =
      this.cargosProvisionalTodos().find((c) => c.nivelId === id) ??
      this.cargosProvisionalTodos()[0];

    return of(cargo ? [{ ...cargo, nivelId: id }] : []).pipe(delay(LATENCIA_MS));
  }

  listarEspecialidades(): Observable<CatalogoItem[]> {
    return of([
      { id: '1', nombre: 'CIVIL' },
      { id: '2', nombre: 'COMERCIAL' },
      { id: '3', nombre: 'CONSTITUCIONAL' },
      { id: '4', nombre: 'PENAL' },
      { id: '5', nombre: 'LABORAL' },
    ]).pipe(delay(LATENCIA_MS));
  }

  listarNivelesInmediatosAnteriores(cargoMagistradoId: string): Observable<CatalogoItem[]> {
    const id = cargoMagistradoId?.trim() ?? '';
    if (!id) {
      return of([]).pipe(delay(LATENCIA_MS));
    }

    const anterior =
      this.anterioresTodos().find((n) => n.nivelId === id) ?? this.anterioresTodos()[0];

    return of(anterior ? [{ ...anterior, nivelId: id }] : []).pipe(delay(LATENCIA_MS));
  }

  listarColegiosAbogados(): Observable<CatalogoItem[]> {
    return of([
      { id: '1', nombre: 'Colegio de Abogados de Lima' },
      { id: '2', nombre: 'Colegio de Abogados del Callao' },
      { id: '3', nombre: 'Colegio de Abogados de Ayacucho' },
    ]).pipe(delay(LATENCIA_MS));
  }

  listarNivelesGrado(): Observable<CatalogoItem[]> {
    return of([
      { id: '1', nombre: 'Doctorado' },
      { id: '2', nombre: 'Maestría' },
      { id: '3', nombre: 'Licenciatura' },
      { id: '4', nombre: 'Bachiller' },
    ]).pipe(delay(LATENCIA_MS));
  }

  listarUniversidades(): Observable<CatalogoItem[]> {
    return of([
      { id: '10', nombre: 'Universidad Nacional Mayor de San Marcos' },
      { id: '11', nombre: 'Pontificia Universidad Católica del Perú' },
      { id: '12', nombre: 'Universidad de San Martín de Porres' },
    ]).pipe(delay(LATENCIA_MS));
  }

  listarPaises(): Observable<CatalogoItem[]> {
    return of([
      { id: '604', nombre: 'Perú' },
      { id: '840', nombre: 'Estados Unidos' },
      { id: '724', nombre: 'España' },
    ]).pipe(delay(LATENCIA_MS));
  }

  listarTiposCursoAmag(): Observable<CatalogoItem[]> {
    return of([
      { id: '1', nombre: 'HABILITANTE' },
      { id: '2', nombre: 'PROFA' },
      { id: '3', nombre: 'ASCENSO' },
    ]).pipe(delay(LATENCIA_MS));
  }

  private nivelesTitular(): NivelTitular[] {
    return [
      { id: '1', nombre: 'JUEZ SUPREMO TITULAR', abreviatura: 'SM' },
      { id: '3', nombre: 'JUEZ SUPERIOR TITULAR', abreviatura: 'SUP' },
    ];
  }

  private cargosTitularTodos(): CatalogoItem[] {
    return [
      { id: '1', nombre: 'JUEZ SUPREMO TITULAR', nivelId: '1' },
      { id: '3', nombre: 'JUEZ SUPERIOR TITULAR', nivelId: '2' },
    ];
  }

  private cargosProvisionalTodos(): CatalogoItem[] {
    return [
      { id: '2', nombre: 'JUEZ SUPREMO PROVISIONAL', nivelId: '1' },
      { id: '4', nombre: 'JUEZ SUPERIOR PROVISIONAL', nivelId: '3' },
    ];
  }

  private anterioresTodos(): CatalogoItem[] {
    return [
      { id: '5', nombre: 'JUEZ SUPERIOR TITULAR', nivelId: '1' },
      { id: '7', nombre: 'JUEZ DE PAZ LETRADO TITULAR', nivelId: '3' },
    ];
  }
}
