import { inject, Injectable, signal } from '@angular/core';
import { finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { ListarRubrosMaestroUseCase } from '../../application/use-cases/meritos/listar-rubros-maestro.use-case';
import { ListarSubrubrosMaestroUseCase } from '../../application/use-cases/meritos/listar-subrubros-maestro.use-case';
import { RubroMaestro } from '../../domain/models/rubro-maestro.model';
import { SubrubroMaestro } from '../../domain/models/subrubro-maestro.model';

/**
 * Catálogo maestro de rubros y subrubros en memoria de sesión.
 * Una consulta por recurso; reutiliza el resultado en toda la app.
 */
@Injectable({ providedIn: 'root' })
export class RubrosMaestroStore {
  private readonly listarRubros = inject(ListarRubrosMaestroUseCase);
  private readonly listarSubrubros = inject(ListarSubrubrosMaestroUseCase);

  readonly rubros = signal<RubroMaestro[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly subrubrosPorId = signal<Record<number, SubrubroMaestro[]>>({});
  readonly cargandoSubrubrosIds = signal<number[]>([]);
  readonly erroresSubrubros = signal<Record<number, string>>({});

  private solicitudRubrosEnCurso: Observable<boolean> | null = null;
  private solicitudesSubrubros = new Map<number, Observable<boolean>>();

  /** Carga el catálogo de rubros si aún no está en memoria. */
  asegurarCargado(): Observable<boolean> {
    if (this.rubros().length > 0) {
      return of(true);
    }

    if (this.solicitudRubrosEnCurso) {
      return this.solicitudRubrosEnCurso;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.solicitudRubrosEnCurso = this.listarRubros.ejecutar().pipe(
      tap((resultado) => {
        if (!resultado.exito) {
          this.rubros.set([]);
          this.error.set(
            resultado.detalle?.mensaje ??
              resultado.mensaje ??
              'No se pudo cargar el catálogo de rubros.'
          );
          return;
        }

        this.rubros.set(this.ordenarRubros(resultado.rubros));
      }),
      map(() => this.rubros().length > 0),
      finalize(() => {
        this.cargando.set(false);
        this.solicitudRubrosEnCurso = null;
      }),
      shareReplay(1)
    );

    return this.solicitudRubrosEnCurso;
  }

  /** Carga subrubros de un rubro si aún no están en memoria. */
  asegurarSubrubrosCargados(idRubro: number): Observable<boolean> {
    if ((this.subrubrosPorId()[idRubro] ?? []).length > 0) {
      return of(true);
    }

    const solicitudExistente = this.solicitudesSubrubros.get(idRubro);
    if (solicitudExistente) {
      return solicitudExistente;
    }

    this.marcarCargandoSubrubro(idRubro, true);
    this.limpiarErrorSubrubro(idRubro);

    const solicitud = this.listarSubrubros.ejecutar(idRubro).pipe(
      tap((resultado) => {
        if (!resultado.exito) {
          this.actualizarSubrubros(idRubro, []);
          this.erroresSubrubros.set({
            ...this.erroresSubrubros(),
            [idRubro]:
              resultado.detalle?.mensaje ??
              resultado.mensaje ??
              'No se pudo cargar el catálogo de subrubros.',
          });
          return;
        }

        this.actualizarSubrubros(idRubro, this.ordenarSubrubros(resultado.subrubros));
      }),
      map(() => (this.subrubrosPorId()[idRubro] ?? []).length > 0),
      finalize(() => {
        this.marcarCargandoSubrubro(idRubro, false);
        this.solicitudesSubrubros.delete(idRubro);
      }),
      shareReplay(1)
    );

    this.solicitudesSubrubros.set(idRubro, solicitud);
    return solicitud;
  }

  subrubrosDe(idRubro: number): SubrubroMaestro[] {
    return this.subrubrosPorId()[idRubro] ?? [];
  }

  cargandoSubrubros(idRubro: number): boolean {
    return this.cargandoSubrubrosIds().includes(idRubro);
  }

  errorSubrubros(idRubro: number): string | null {
    return this.erroresSubrubros()[idRubro] ?? null;
  }

  private actualizarSubrubros(idRubro: number, subrubros: SubrubroMaestro[]): void {
    this.subrubrosPorId.set({
      ...this.subrubrosPorId(),
      [idRubro]: subrubros,
    });
  }

  private marcarCargandoSubrubro(idRubro: number, cargando: boolean): void {
    const actuales = new Set(this.cargandoSubrubrosIds());
    if (cargando) {
      actuales.add(idRubro);
    } else {
      actuales.delete(idRubro);
    }
    this.cargandoSubrubrosIds.set([...actuales]);
  }

  private limpiarErrorSubrubro(idRubro: number): void {
    const errores = { ...this.erroresSubrubros() };
    delete errores[idRubro];
    this.erroresSubrubros.set(errores);
  }

  private ordenarRubros(rubros: RubroMaestro[]): RubroMaestro[] {
    return [...rubros].sort((a, b) => a.orden - b.orden || a.codigo.localeCompare(b.codigo));
  }

  private ordenarSubrubros(subrubros: SubrubroMaestro[]): SubrubroMaestro[] {
    return [...subrubros].sort((a, b) => a.orden - b.orden || a.codigo.localeCompare(b.codigo));
  }
}
