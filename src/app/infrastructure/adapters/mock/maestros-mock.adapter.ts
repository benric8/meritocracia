import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { NivelTitular } from '../../../domain/models/nivel-titular.model';
import { RubroMaestro } from '../../../domain/models/rubro-maestro.model';
import { SubrubroMaestro } from '../../../domain/models/subrubro-maestro.model';
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

  buscarUniversidades(
    termino: string,
    paisId?: string,
    limite = 20
  ): Observable<CatalogoItem[]> {
    const texto = termino.trim().toLowerCase();
    if (texto.length < 2) {
      return of([]);
    }

    return this.listarUniversidades().pipe(
      map((lista) =>
        lista
          .filter((item) => item.nombre.toLowerCase().includes(texto))
          .slice(0, Math.min(Math.max(limite, 1), 50))
      )
    );
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

  listarRubros(): Observable<RubroMaestro[]> {
    return of(this.rubrosMaestro()).pipe(delay(LATENCIA_MS));
  }

  listarSubrubros(idRubro: number): Observable<SubrubroMaestro[]> {
    return of(this.subrubrosMaestro(idRubro)).pipe(delay(LATENCIA_MS));
  }

  private subrubrosMaestro(idRubro: number): SubrubroMaestro[] {
    if (idRubro !== 5) {
      return [];
    }

    return [
      {
        idSubrubro: 1,
        idRubro: 5,
        codigo: 'E1',
        nombre: 'Estudios de doctorado y/o maestría',
        orden: 1,
        puntajeMaximo: null,
        aniosVigencia: null,
      },
      {
        idSubrubro: 2,
        idRubro: 5,
        codigo: 'E2',
        nombre: 'Pasantía',
        orden: 2,
        puntajeMaximo: null,
        aniosVigencia: 5,
      },
      {
        idSubrubro: 3,
        idRubro: 5,
        codigo: 'E3',
        nombre: 'Cursos de especialización, postgrado y diplomados',
        orden: 3,
        puntajeMaximo: null,
        aniosVigencia: 5,
      },
      {
        idSubrubro: 4,
        idRubro: 5,
        codigo: 'E4',
        nombre: 'Certámenes académicos (expositor/ponente/panelista)',
        orden: 4,
        puntajeMaximo: null,
        aniosVigencia: 5,
      },
      {
        idSubrubro: 5,
        idRubro: 5,
        codigo: 'E5',
        nombre: 'Asistencia a eventos académicos',
        orden: 5,
        puntajeMaximo: null,
        aniosVigencia: 5,
      },
      {
        idSubrubro: 6,
        idRubro: 5,
        codigo: 'E6',
        nombre: 'Estudios de ofimática',
        orden: 6,
        puntajeMaximo: null,
        aniosVigencia: null,
      },
    ];
  }

  private rubrosMaestro(): RubroMaestro[] {
    return [
      {
        idRubro: 1,
        codigo: 'A',
        nombre: 'Producción jurisdiccional',
        orden: 1,
        puntajeMaximo: null,
        tieneDetalle: false,
        tieneSubrubros: false,
      },
      {
        idRubro: 2,
        codigo: 'B',
        nombre: 'Antigüedad en el cargo',
        orden: 2,
        puntajeMaximo: 12,
        tieneDetalle: true,
        tieneSubrubros: false,
      },
      {
        idRubro: 3,
        codigo: 'C',
        nombre: 'Grados académicos y títulos profesionales',
        orden: 3,
        puntajeMaximo: 17,
        tieneDetalle: false,
        tieneSubrubros: false,
      },
      {
        idRubro: 4,
        codigo: 'D',
        nombre: 'Estudios de preparación AMAG',
        orden: 4,
        puntajeMaximo: 8,
        tieneDetalle: false,
        tieneSubrubros: false,
      },
      {
        idRubro: 5,
        codigo: 'E',
        nombre: 'Estudios de perfeccionamiento',
        orden: 5,
        puntajeMaximo: 14,
        tieneDetalle: false,
        tieneSubrubros: true,
      },
      {
        idRubro: 7,
        codigo: 'F',
        nombre: 'Publicaciones de índole jurídico',
        orden: 6,
        puntajeMaximo: 3,
        tieneDetalle: false,
        tieneSubrubros: false,
      },
      {
        idRubro: 8,
        codigo: 'G',
        nombre: 'Distinciones y condecoraciones',
        orden: 7,
        puntajeMaximo: 3,
        tieneDetalle: false,
        tieneSubrubros: false,
      },
      {
        idRubro: 9,
        codigo: 'H',
        nombre: 'Docencia universitaria',
        orden: 8,
        puntajeMaximo: 3,
        tieneDetalle: false,
        tieneSubrubros: false,
      },
      {
        idRubro: 10,
        codigo: 'I',
        nombre: 'Deméritos',
        orden: 9,
        puntajeMaximo: null,
        tieneDetalle: false,
        tieneSubrubros: false,
      },
    ];
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
