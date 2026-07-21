import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, EMPTY, finalize, map, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { CalcularAniosColegiaturaUseCase } from '../../../../../../application/use-cases/meritos/calcular-anios-colegiatura.use-case';
import { CalcularPuntajeAntiguedadUseCase } from '../../../../../../application/use-cases/meritos/calcular-puntaje-antiguedad.use-case';
import { CalcularTiempoServicioUseCase } from '../../../../../../application/use-cases/meritos/calcular-tiempo-servicio.use-case';
import { GuardarPeriodoNivelAnteriorFichaUseCase } from '../../../../../../application/use-cases/meritos/guardar-periodo-nivel-anterior-ficha.use-case';
import { GuardarTitularidadFichaUseCase } from '../../../../../../application/use-cases/meritos/guardar-titularidad-ficha.use-case';
import {
  CatalogosAntiguedad,
  ListarCatalogosAntiguedadUseCase,
} from '../../../../../../application/use-cases/meritos/listar-catalogos-antiguedad.use-case';
import { MutarItemsRubroAntiguedadUseCase } from '../../../../../../application/use-cases/meritos/mutar-items-rubro-antiguedad.use-case';
import { CatalogoItem } from '../../../../../../domain/models/catalogo-item.model';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import {
  Colegiatura,
  PeriodoNivelAnterior,
  Provisionalidad,
  RubroAntiguedad,
  TitularidadActual,
} from '../../../../../../domain/models/rubro-antiguedad.model';
import {
  TIEMPO_SERVICIO_CERO,
  TiempoServicio,
} from '../../../../../../domain/models/tiempo-servicio.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import {
  aDateDesdeIso,
  aFechaIsoLocal,
  corregirFechaFinSiAnteriorAInicio,
  crearFiltroFechaMaxima,
  crearFiltroFechaMinima,
  esFechaAnterior,
  esIdPersistidoApi,
  formatearFechaCorta,
  formatearPuntaje,
} from '../rubros.util';
import {
  ColegiaturaGuardada,
  FormularioColegiatura,
  FormularioColegiaturaData,
} from './formulario-colegiatura/formulario-colegiatura';
import {
  FormularioProvisionalidad,
  FormularioProvisionalidadData,
  ProvisionalidadGuardada,
} from './formulario-provisionalidad/formulario-provisionalidad';

@Component({
  selector: 'app-rubro-antiguedad',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
  ],
  templateUrl: './rubro-antiguedad.html',
  styleUrl: './rubro-antiguedad.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroAntiguedadComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarCatalogos = inject(ListarCatalogosAntiguedadUseCase);
  private readonly calcularTiempo = inject(CalcularTiempoServicioUseCase);
  private readonly calcularPuntaje = inject(CalcularPuntajeAntiguedadUseCase);
  private readonly calcularAniosColegiatura = inject(CalcularAniosColegiaturaUseCase);
  private readonly guardarTitularidad = inject(GuardarTitularidadFichaUseCase);
  private readonly guardarPeriodo = inject(GuardarPeriodoNivelAnteriorFichaUseCase);
  private readonly mutarItems = inject(MutarItemsRubroAntiguedadUseCase);

  readonly fichaId = input<string | null>(null);
  readonly nivelId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroInicial = input<RubroAntiguedad | null>(null);
  readonly fechaValoracion = input<string | null>(null);
  readonly cargandoDetalle = input(false);
  readonly puntajeChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly cargandoCatalogos = signal(false);
  protected readonly calculandoTitular = signal(false);
  protected readonly calculandoPeriodo = signal(false);
  protected readonly guardandoTitular = signal(false);
  protected readonly guardandoPeriodo = signal(false);
  protected readonly titularGuardada = signal(false);
  protected readonly antiguedadId = signal<string | null>(null);
  protected readonly puedeGuardarTitularidad = signal(false);
  protected readonly puedeEditarDesempate = computed(
    () => this.titularGuardada() && !!this.antiguedadId() && !this.soloLectura()
  );
  protected readonly etiquetaBotonTitularidad = computed(() =>
    this.titularGuardada() && this.antiguedadId() ? 'Actualizar' : 'Guardar'
  );
  protected readonly iconoBotonTitularidad = computed(() =>
    this.titularGuardada() && this.antiguedadId() ? 'sync' : 'save'
  );
  protected readonly periodoGuardado = signal(false);
  protected readonly periodoInmediatoId = signal<string | null>(null);
  protected readonly etiquetaBotonPeriodo = computed(() =>
    this.periodoGuardado() && this.periodoInmediatoId() ? 'Actualizar' : 'Guardar'
  );
  protected readonly iconoBotonPeriodo = computed(() =>
    this.periodoGuardado() && this.periodoInmediatoId() ? 'sync' : 'save'
  );
  protected readonly errorCatalogos = signal<string | null>(null);

  protected readonly distritos = signal<CatalogoItem[]>([]);
  protected readonly cargosTitular = signal<CatalogoItem[]>([]);
  protected readonly cargosProvisional = signal<CatalogoItem[]>([]);
  protected readonly especialidades = signal<CatalogoItem[]>([]);
  protected readonly nivelesAnteriores = signal<CatalogoItem[]>([]);
  protected readonly colegios = signal<CatalogoItem[]>([]);

  protected readonly tiempoTitular = signal<TiempoServicio>(TIEMPO_SERVICIO_CERO);
  protected readonly puntajeTitular = signal(0);
  protected readonly tiempoPeriodo = signal<TiempoServicio>(TIEMPO_SERVICIO_CERO);
  protected readonly provisionalidades = signal<Provisionalidad[]>([]);
  protected readonly sumaProvisionalidades = signal<TiempoServicio>(TIEMPO_SERVICIO_CERO);
  protected readonly colegiaturas = signal<Colegiatura[]>([]);

  protected readonly formatearFecha = formatearFechaCorta;
  protected readonly formatearPuntaje = formatearPuntaje;

  /** En periodo: fecha fin no puede ser anterior a fecha inicio. */
  protected readonly filtroFechaFinPeriodo = crearFiltroFechaMinima(
    () => this.formularioPeriodo.controls.fechaInicio.value
  );
  /** En periodo: fecha inicio no puede ser posterior a fecha fin. */
  protected readonly filtroFechaInicioPeriodo = crearFiltroFechaMaxima(
    () => this.formularioPeriodo.controls.fechaFin.value
  );

  protected readonly formularioTitular = this.fb.group({
    distritoJudicialId: this.fb.nonNullable.control('', Validators.required),
    cargoTitularId: this.fb.nonNullable.control({ value: '', disabled: true }, Validators.required),
    fechaJuramentacion: this.fb.control<Date | null>(null, Validators.required),
    horaJuramento: this.fb.nonNullable.control('', Validators.required),
    fechaCese: this.fb.control<Date | null>(null),
    fechaReincorporacion: this.fb.control<Date | null>(null),
    primeraEspecialidadId: this.fb.nonNullable.control('', Validators.required),
    segundaEspecialidadId: this.fb.nonNullable.control(''),
  });

  protected readonly formularioPeriodo = this.fb.group({
    nivelInmediatoAnteriorId: this.fb.nonNullable.control({ value: '', disabled: true }),
    fechaInicio: this.fb.control<Date | null>(null),
    fechaFin: this.fb.control<Date | null>(null),
  });

  private catalogosCargados = false;
  private ultimoRubroHidratadoClave: string | null = null;
  /** True solo durante la hidratación programática del rubro (GET / guardar). */
  private hidratandoRubro = false;
  private cargosTitularTodos: CatalogoItem[] = [];
  private nivelesAnterioresTodos: CatalogoItem[] = [];
  private readonly recalcularTitular$ = new Subject<void>();
  private readonly recalcularPeriodo$ = new Subject<void>();
  private readonly detenerRecalcTitular$ = new Subject<void>();
  private readonly detenerRecalcPeriodo$ = new Subject<void>();
  /** Solo true tras edición manual; evita recalcular al hidratar desde GET. */
  private readonly usuarioEditoTitular = signal(false);
  private readonly usuarioEditoPeriodo = signal(false);

  constructor() {
    effect(() => {
      this.fechaValoracion();
      if (this.hidratandoRubro) {
        return;
      }
      if (this.usuarioEditoTitular()) {
        this.solicitarRecalculoTitular();
      }
      if (this.usuarioEditoPeriodo()) {
        this.solicitarRecalculoPeriodo();
      }
      this.solicitarRecalculoAniosColegiaturas();
    });

    effect(() => {
      const rubro = this.rubroInicial();
      if (!this.catalogosCargados || !this.tieneRubroUtil(rubro)) {
        return;
      }

      const clave = this.claveRubro(rubro!);
      if (this.ultimoRubroHidratadoClave === clave) {
        return;
      }

      this.hidratarRubroDesdeApi(rubro!);
      this.ultimoRubroHidratadoClave = clave;
    });

    effect(() => {
      this.nivelId();
      if (!this.catalogosCargados) {
        return;
      }
      this.cargarCatalogos();
    });

    effect(() => {
      if (this.soloLectura() || !this.puedeEditarDesempate()) {
        this.formularioPeriodo.disable({ emitEvent: false });
      } else {
        this.formularioPeriodo.controls.fechaInicio.enable({ emitEvent: false });
        this.formularioPeriodo.controls.fechaFin.enable({ emitEvent: false });
        // El nivel inmediato anterior lo fija el cargo de la ficha.
        this.formularioPeriodo.controls.nivelInmediatoAnteriorId.disable({ emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.inicializarRecalculosReactivos();
    this.cargarCatalogos();
    this.escucharFormularioTitular();
    this.escucharFormularioPeriodo();
  }

  /** Cancela cálculos anteriores y unifica el patrón titular / periodo. */
  private inicializarRecalculosReactivos(): void {
    this.recalcularTitular$
      .pipe(
        debounceTime(300),
        switchMap(() =>
          this.calcularTiempoTitular$().pipe(takeUntil(this.detenerRecalcTitular$))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((tiempo) => {
        this.tiempoTitular.set(tiempo);
        this.actualizarPuntaje(tiempo);
      });

    this.recalcularPeriodo$
      .pipe(
        debounceTime(300),
        switchMap(() =>
          this.calcularTiempoPeriodo$().pipe(takeUntil(this.detenerRecalcPeriodo$))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((tiempo) => {
        this.tiempoPeriodo.set(tiempo);
      });
  }

  /** Solo para edición del usuario; la hidratación usa los tiempos del API. */
  private solicitarRecalculoTitular(): void {
    if (this.hidratandoRubro || !this.usuarioEditoTitular()) {
      return;
    }
    this.recalcularTitular$.next();
  }

  private solicitarRecalculoPeriodo(): void {
    if (this.hidratandoRubro || !this.usuarioEditoPeriodo()) {
      return;
    }
    this.recalcularPeriodo$.next();
  }

  private solicitarRecalculoAniosColegiaturas(): void {
    if (this.hidratandoRubro) {
      return;
    }
    this.recalcularAniosColegiaturas();
  }

  protected onGuardarTitularidad(): void {
    const id = this.fichaId();
    if (!id || this.soloLectura() || !this.puedeGuardarTitularidad()) {
      return;
    }

    this.formularioTitular.markAllAsTouched();
    if (!this.puedeGuardarTitularidad()) {
      return;
    }

    const data = this.construirTitularidadActual();
    const esActualizacion = this.titularGuardada() && !!this.antiguedadId();
    this.guardandoTitular.set(true);

    this.guardarTitularidad
      .ejecutar(id, data, this.antiguedadId())
      .pipe(
        take(1),
        finalize(() => this.guardandoTitular.set(false))
      )
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion ? 'No se pudo actualizar la titularidad' : 'No se pudo guardar la titularidad',
            {
              mensaje:
                resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        this.aplicarTitularidadGuardada(resultado.ficha.rubroAntiguedad);
        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito(
          esActualizacion ? 'Titularidad actualizada' : 'Titularidad guardada',
          esActualizacion
            ? 'Los datos de titularidad se actualizaron correctamente.'
            : 'Los datos de titularidad se guardaron correctamente.'
        );
      });
  }

  private aplicarTitularidadGuardada(rubro: RubroAntiguedad | null | undefined): void {
    if (!rubro) {
      return;
    }

    this.titularGuardada.set(true);
    this.antiguedadId.set(rubro.id);
    this.tiempoTitular.set(rubro.titularidad.tiempoTotal);
    this.puntajeTitular.set(rubro.titularidad.puntaje);
    this.puntajeChange.emit(rubro.titularidad.puntaje);
    this.usuarioEditoTitular.set(false);
    this.calculandoTitular.set(false);
  }

  protected onGuardarPeriodo(): void {
    const id = this.fichaId();
    if (!id || this.soloLectura() || !this.puedeEditarDesempate()) {
      return;
    }

    const raw = this.formularioPeriodo.getRawValue();
    if (
      raw.fechaInicio &&
      raw.fechaFin &&
      esFechaAnterior(raw.fechaFin, raw.fechaInicio)
    ) {
      this.formularioPeriodo.controls.fechaFin.setErrors({ fechaAnteriorAInicio: true });
      this.formularioPeriodo.controls.fechaFin.markAsTouched();
      void this.alertas.error('Rango de fechas inválido', {
        mensaje: 'La fecha fin no puede ser anterior a la fecha de inicio.',
      });
      return;
    }

    const data = this.construirPeriodoNivelAnterior();
    const esActualizacion = this.periodoGuardado() && !!this.periodoInmediatoId();
    this.guardandoPeriodo.set(true);

    this.guardarPeriodo
      .ejecutar(id, data)
      .pipe(
        take(1),
        finalize(() => this.guardandoPeriodo.set(false))
      )
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion ? 'No se pudo actualizar el periodo' : 'No se pudo guardar el periodo',
            {
              mensaje:
                resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        this.aplicarPeriodoGuardado(resultado.ficha.rubroAntiguedad);
        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito(
          esActualizacion ? 'Periodo actualizado' : 'Periodo guardado',
          esActualizacion
            ? 'El periodo de nivel anterior se actualizó correctamente.'
            : 'El periodo de nivel anterior se guardó correctamente.'
        );
      });
  }

  private aplicarPeriodoGuardado(rubro: RubroAntiguedad | null | undefined): void {
    if (!rubro) {
      return;
    }

    this.periodoGuardado.set(true);
    this.periodoInmediatoId.set(rubro.periodoNivelAnterior.id);
    this.tiempoPeriodo.set(rubro.periodoNivelAnterior.tiempoTotal);
    this.usuarioEditoPeriodo.set(false);
    this.calculandoPeriodo.set(false);
  }

  protected abrirProvisionalidad(existente?: Provisionalidad): void {
    if (!this.puedeEditarDesempate() && !existente) {
      return;
    }
    if (!this.titularGuardada() || !this.antiguedadId()) {
      void this.alertas.error('Titularidad pendiente', {
        mensaje: 'Guarde primero la titularidad para registrar provisionalidades.',
      });
      return;
    }
    const data: FormularioProvisionalidadData = {
      cargos: this.cargosProvisionalDelNivel(),
      provisionalidad: existente ?? null,
    };

    const ref = this.dialog.open(FormularioProvisionalidad, {
      width: '720px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const sub = ref.componentInstance.guardar.subscribe((item) => {
      this.onGuardarProvisionalidad(item, ref);
    });
    ref.afterClosed().subscribe(() => sub.unsubscribe());
  }

  protected async eliminarProvisionalidad(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar provisionalidad',
      html: '¿Confirma que desea eliminar este periodo de provisionalidad?',
      textoConfirmar: 'Eliminar',
    });
    if (!ok) {
      return;
    }

    const fichaId = this.fichaId();
    if (!fichaId || !esIdPersistidoApi(id)) {
      this.provisionalidades.update((lista) => lista.filter((p) => p.id !== id));
      this.recalcularSumaProvisionalidades();
      return;
    }

    this.mutarItems
      .eliminarProvisionalidad(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar la provisionalidad', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroAntiguedad;
        if (rubro) {
          this.sincronizarItemsDesdeRubro(rubro);
        }
        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito(
          'Provisionalidad eliminada',
          'El periodo de provisionalidad se eliminó correctamente.'
        );
      });
  }

  protected abrirColegiatura(existente?: Colegiatura): void {
    if (!this.puedeEditarDesempate() && !existente) {
      return;
    }
    if (!this.titularGuardada() || !this.antiguedadId()) {
      void this.alertas.error('Titularidad pendiente', {
        mensaje: 'Guarde primero la titularidad para registrar colegiaturas.',
      });
      return;
    }
    const data: FormularioColegiaturaData = {
      colegios: this.colegios(),
      fechaValoracion: this.fechaValoracion(),
      colegiatura: existente ?? null,
    };

    const ref = this.dialog.open(FormularioColegiatura, {
      width: '560px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const sub = ref.componentInstance.guardar.subscribe((item) => {
      this.onGuardarColegiatura(item, ref);
    });
    ref.afterClosed().subscribe(() => sub.unsubscribe());
  }

  protected async eliminarColegiatura(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar colegiatura',
      html: '¿Confirma que desea eliminar esta colegiatura?',
      textoConfirmar: 'Eliminar',
    });
    if (!ok) {
      return;
    }

    const fichaId = this.fichaId();
    if (!fichaId || !esIdPersistidoApi(id)) {
      this.colegiaturas.update((lista) => lista.filter((c) => c.id !== id));
      return;
    }

    this.mutarItems
      .eliminarColegiatura(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar la colegiatura', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroAntiguedad;
        if (rubro) {
          this.sincronizarItemsDesdeRubro(rubro);
        }
        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito(
          'Colegiatura eliminada',
          'La colegiatura se eliminó correctamente.'
        );
      });
  }

  private onGuardarProvisionalidad(
    item: ProvisionalidadGuardada,
    ref: MatDialogRef<FormularioProvisionalidad>
  ): void {
    const registro: Provisionalidad = {
      id: item.id!,
      fechaInicio: item.fechaInicio,
      fechaFin: item.fechaFin,
      tiempoTotal: item.tiempoTotal,
      cargoId: item.cargoId,
      cargoNombre: item.cargoNombre,
      organoJurisdiccional: item.organoJurisdiccional,
      documento: item.documento,
    };

    const fichaId = this.fichaId();
    const esActualizacion = esIdPersistidoApi(registro.id);
    if (!fichaId) {
      this.provisionalidades.update((lista) => {
        const idx = lista.findIndex((p) => p.id === registro.id);
        if (idx >= 0) {
          const copia = [...lista];
          copia[idx] = registro;
          return copia;
        }
        return [...lista, registro];
      });
      this.recalcularSumaProvisionalidades();
      ref.close();
      return;
    }

    this.mutarItems
      .upsertProvisionalidad(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion
              ? 'No se pudo actualizar la provisionalidad'
              : 'No se pudo guardar la provisionalidad',
            {
              mensaje:
                resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroAntiguedad;
        if (rubro) {
          this.sincronizarItemsDesdeRubro(rubro);
        }
        this.fichaActualizada.emit(resultado.ficha);
        ref.close();
        await this.alertas.exito(
          esActualizacion ? 'Provisionalidad actualizada' : 'Provisionalidad guardada',
          esActualizacion
            ? 'El periodo de provisionalidad se actualizó correctamente.'
            : 'El periodo de provisionalidad se guardó correctamente.'
        );
      });
  }

  private onGuardarColegiatura(
    item: ColegiaturaGuardada,
    ref: MatDialogRef<FormularioColegiatura>
  ): void {
    const registro: Colegiatura = {
      id: item.id!,
      colegioId: item.colegioId,
      colegioNombre: item.colegioNombre,
      fechaColegiatura: item.fechaColegiatura,
      anios: item.anios,
    };

    const fichaId = this.fichaId();
    const esActualizacion = esIdPersistidoApi(registro.id);
    if (!fichaId) {
      this.colegiaturas.update((lista) => {
        const idx = lista.findIndex((c) => c.id === registro.id);
        if (idx >= 0) {
          const copia = [...lista];
          copia[idx] = registro;
          return copia;
        }
        return [...lista, registro];
      });
      ref.close();
      return;
    }

    this.mutarItems
      .upsertColegiatura(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion ? 'No se pudo actualizar la colegiatura' : 'No se pudo guardar la colegiatura',
            {
              mensaje:
                resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroAntiguedad;
        if (rubro) {
          this.sincronizarItemsDesdeRubro(rubro);
        }
        this.fichaActualizada.emit(resultado.ficha);
        ref.close();
        await this.alertas.exito(
          esActualizacion ? 'Colegiatura actualizada' : 'Colegiatura guardada',
          esActualizacion
            ? 'La colegiatura se actualizó correctamente.'
            : 'La colegiatura se guardó correctamente.'
        );
      });
  }

  private cargarCatalogos(): void {
    const cargoMagistradoId = this.nivelId()?.trim() ?? '';
    this.cargandoCatalogos.set(true);
    this.errorCatalogos.set(null);

    this.listarCatalogos
      .ejecutar(cargoMagistradoId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoCatalogos.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          this.errorCatalogos.set(
            resultado.detalle?.mensaje ??
              resultado.mensaje ??
              'No se pudieron cargar los catálogos de antigüedad.'
          );
          return;
        }

        this.aplicarCatalogos(resultado.catalogos);
        this.catalogosCargados = true;

        const rubro = this.rubroInicial();
        if (this.tieneRubroUtil(rubro)) {
          const clave = this.claveRubro(rubro!);
          if (this.ultimoRubroHidratadoClave !== clave) {
            this.hidratarRubroDesdeApi(rubro!);
            this.ultimoRubroHidratadoClave = clave;
          }
        }

        if (this.soloLectura()) {
          this.formularioTitular.disable({ emitEvent: false });
          this.formularioPeriodo.disable({ emitEvent: false });
        } else {
          // Cargo titular y nivel inmediato anterior los fija el cargo de la ficha.
          this.formularioTitular.controls.cargoTitularId.disable({ emitEvent: false });
          this.formularioPeriodo.controls.nivelInmediatoAnteriorId.disable({ emitEvent: false });
        }
      });
  }

  private aplicarCatalogos(catalogos: CatalogosAntiguedad): void {
    this.distritos.set(catalogos.distritosJudiciales);
    this.cargosTitularTodos = catalogos.cargosTitular;
    this.cargosProvisional.set(catalogos.cargosProvisional);
    this.especialidades.set(catalogos.especialidades);
    this.nivelesAnterioresTodos = catalogos.nivelesInmediatosAnteriores;
    this.colegios.set(catalogos.colegiosAbogados);
    this.sincronizarCamposDerivadosDelNivel();
  }

  /**
   * Campos derivados del cargo de magistrado de la ficha (no editables):
   * - Cargo titular actual
   * - Nivel/cargo inmediato anterior
   */
  private sincronizarCamposDerivadosDelNivel(): void {
    this.sincronizarCargoConNivel();
    this.sincronizarNivelInmediatoAnterior();
  }

  private sincronizarCargoConNivel(): void {
    const permitidos = this.cargosTitularTodos;
    this.cargosTitular.set(permitidos);

    const cargoId = permitidos[0]?.id ?? '';
    const control = this.formularioTitular.controls.cargoTitularId;
    if (control.getRawValue() !== cargoId) {
      control.setValue(cargoId, { emitEvent: false });
    }
    control.disable({ emitEvent: false });
    this.actualizarPuedeGuardarTitularidad();
  }

  private sincronizarNivelInmediatoAnterior(): void {
    const permitidos = this.nivelesAnterioresTodos;
    this.nivelesAnteriores.set(permitidos);

    const nivelAnteriorId = permitidos[0]?.id ?? '';
    const control = this.formularioPeriodo.controls.nivelInmediatoAnteriorId;
    if (control.getRawValue() !== nivelAnteriorId) {
      control.setValue(nivelAnteriorId, { emitEvent: false });
    }
    control.disable({ emitEvent: false });
  }

  /** Cargos de provisionalidad del cargo de magistrado de la ficha. */
  private cargosProvisionalDelNivel(): CatalogoItem[] {
    return this.cargosProvisional();
  }

  private tieneRubroUtil(rubro: RubroAntiguedad | null): boolean {
    if (!rubro) {
      return false;
    }
    return (
      !!rubro.id ||
      !!rubro.titularidad.fechaJuramentacion ||
      rubro.provisionalidades.length > 0 ||
      rubro.colegiaturas.length > 0 ||
      !!rubro.periodoNivelAnterior.fechaInicio
    );
  }

  private claveRubro(rubro: RubroAntiguedad): string {
    return [
      rubro.id ?? '',
      rubro.titularidad.fechaJuramentacion ?? '',
      rubro.periodoNivelAnterior.fechaInicio ?? '',
      rubro.provisionalidades.length,
      rubro.colegiaturas.length,
    ].join('|');
  }

  /**
   * Hidrata formulario y tiempos desde API o respuesta de guardado.
   * No recalcula: el backend es la fuente de verdad en este flujo.
   */
  private hidratarRubroDesdeApi(rubro: RubroAntiguedad): void {
    const { titularidad, periodoNivelAnterior } = rubro;

    this.hidratandoRubro = true;
    this.detenerRecalcTitular$.next();
    this.detenerRecalcPeriodo$.next();
    try {
      this.usuarioEditoTitular.set(false);
      this.usuarioEditoPeriodo.set(false);
      this.calculandoTitular.set(false);
      this.calculandoPeriodo.set(false);

      this.formularioTitular.patchValue(
        {
          distritoJudicialId: titularidad.distritoJudicialId,
          fechaJuramentacion: aDateDesdeIso(titularidad.fechaJuramentacion),
          horaJuramento: titularidad.horaJuramento ?? '',
          fechaCese: aDateDesdeIso(titularidad.fechaCese),
          fechaReincorporacion: aDateDesdeIso(titularidad.fechaReincorporacion),
          primeraEspecialidadId: titularidad.primeraEspecialidadId,
          segundaEspecialidadId: titularidad.segundaEspecialidadId,
        },
        { emitEvent: false }
      );
      this.sincronizarCamposDerivadosDelNivel();

      this.formularioPeriodo.patchValue(
        {
          fechaInicio: aDateDesdeIso(periodoNivelAnterior.fechaInicio),
          fechaFin: aDateDesdeIso(periodoNivelAnterior.fechaFin),
        },
        { emitEvent: false }
      );
      this.sincronizarNivelInmediatoAnterior();

      this.tiempoTitular.set(titularidad.tiempoTotal);
      this.puntajeTitular.set(titularidad.puntaje);
      this.puntajeChange.emit(titularidad.puntaje);
      this.tiempoPeriodo.set(periodoNivelAnterior.tiempoTotal);
      this.provisionalidades.set(rubro.provisionalidades);
      this.sumaProvisionalidades.set(rubro.sumaProvisionalidades);
      this.colegiaturas.set(rubro.colegiaturas);

      this.titularGuardada.set(!!rubro.id || !!titularidad.fechaJuramentacion);
      this.antiguedadId.set(rubro.id);
      this.periodoInmediatoId.set(
        esIdPersistidoApi(periodoNivelAnterior.id) ? periodoNivelAnterior.id : null
      );
      this.periodoGuardado.set(
        esIdPersistidoApi(periodoNivelAnterior.id) ||
          (!!periodoNivelAnterior.fechaInicio && !!periodoNivelAnterior.fechaFin)
      );
      this.actualizarPuedeGuardarTitularidad();
      this.enriquecerNombresCatalogo();
    } finally {
      this.hidratandoRubro = false;
    }
  }

  private enriquecerNombresCatalogo(): void {
    const cargos = this.cargosProvisional();
    const colegios = this.colegios();

    this.provisionalidades.update((lista) =>
      lista.map((item) => ({
        ...item,
        cargoNombre:
          cargos.find((cargo) => cargo.id === item.cargoId)?.nombre ?? item.cargoNombre,
      }))
    );

    this.colegiaturas.update((lista) =>
      lista.map((item) => ({
        ...item,
        colegioNombre:
          colegios.find((colegio) => colegio.id === item.colegioId)?.nombre ?? item.colegioNombre,
      }))
    );
  }

  private sincronizarItemsDesdeRubro(rubro: RubroAntiguedad): void {
    this.provisionalidades.set(rubro.provisionalidades);
    this.sumaProvisionalidades.set(rubro.sumaProvisionalidades);
    this.colegiaturas.set(rubro.colegiaturas);
    this.recalcularAniosColegiaturas();
  }

  private construirTitularidadActual(): TitularidadActual {
    const raw = this.formularioTitular.getRawValue();
    return {
      distritoJudicialId: raw.distritoJudicialId,
      cargoTitularId: raw.cargoTitularId,
      fechaJuramentacion: raw.fechaJuramentacion
        ? aFechaIsoLocal(raw.fechaJuramentacion)
        : null,
      horaJuramento: raw.horaJuramento || null,
      fechaCese: raw.fechaCese ? aFechaIsoLocal(raw.fechaCese) : null,
      fechaReincorporacion: raw.fechaReincorporacion
        ? aFechaIsoLocal(raw.fechaReincorporacion)
        : null,
      fechaValoracion: this.fechaValoracion()?.slice(0, 10) ?? null,
      tiempoTotal: this.tiempoTitular(),
      puntaje: this.puntajeTitular(),
      primeraEspecialidadId: raw.primeraEspecialidadId,
      segundaEspecialidadId: raw.segundaEspecialidadId,
    };
  }

  private construirPeriodoNivelAnterior(): PeriodoNivelAnterior {
    const raw = this.formularioPeriodo.getRawValue();
    return {
      id: this.periodoInmediatoId(),
      nivelInmediatoAnteriorId: raw.nivelInmediatoAnteriorId,
      fechaInicio: raw.fechaInicio ? aFechaIsoLocal(raw.fechaInicio) : null,
      fechaFin: raw.fechaFin ? aFechaIsoLocal(raw.fechaFin) : null,
      tiempoTotal: this.tiempoPeriodo(),
    };
  }

  /** Valores alineados al mockup para facilitar la demostración. */
  private precargarValoresDemo(catalogos: CatalogosAntiguedad): void {
    const distrito =
      catalogos.distritosJudiciales.find((d) => d.nombre === 'Huancavelica')?.id ??
      catalogos.distritosJudiciales[0]?.id ??
      '';
    const especialidad =
      catalogos.especialidades.find((e) => e.nombre === 'Civil')?.id ??
      catalogos.especialidades[0]?.id ??
      '';
    const cargoProv = this.cargosProvisionalDelNivel()[0] ?? catalogos.cargosProvisional[0];
    const colegio =
      catalogos.colegiosAbogados.find((c) => c.nombre === 'LIMA') ??
      catalogos.colegiosAbogados[0];

    this.formularioTitular.patchValue(
      {
        distritoJudicialId: distrito,
        fechaJuramentacion: aDateDesdeIso('2013-04-09'),
        horaJuramento: '11:15',
        primeraEspecialidadId: especialidad,
        segundaEspecialidadId: '',
      },
      { emitEvent: false }
    );
    this.sincronizarCamposDerivadosDelNivel();
    this.usuarioEditoTitular.set(true);
    this.solicitarRecalculoTitular();

    this.formularioPeriodo.patchValue(
      {
        fechaInicio: aDateDesdeIso('2003-11-18'),
        fechaFin: aDateDesdeIso('2013-04-08'),
      },
      { emitEvent: false }
    );
    this.sincronizarNivelInmediatoAnterior();
    this.usuarioEditoPeriodo.set(true);
    this.solicitarRecalculoPeriodo();

    if (cargoProv) {
      this.provisionalidades.set([
        {
          id: 'prov-demo-1',
          fechaInicio: '2009-03-03',
          fechaFin: '2013-04-09',
          tiempoTotal: TIEMPO_SERVICIO_CERO,
          cargoId: cargoProv.id,
          cargoNombre: cargoProv.nombre,
          organoJurisdiccional: 'Corte Superior de Huancavelica',
          documento: 'Resolución N.° 041-2009-PJ',
        },
      ]);
      this.recalcularTiempoProvisionalidadesDemo();
    }

    if (colegio) {
      this.colegiaturas.set([
        {
          id: 'col-demo-1',
          colegioId: colegio.id,
          colegioNombre: colegio.nombre,
          fechaColegiatura: '1996-10-16',
          anios: 0,
        },
      ]);
      this.recalcularAniosColegiaturas();
    }
  }

  private recalcularTiempoProvisionalidadesDemo(): void {
    const lista = this.provisionalidades();
    if (!lista.length) {
      return;
    }

    lista.forEach((item, index) => {
      this.calcularTiempo
        .ejecutarEntreFechas(item.fechaInicio, item.fechaFin)
        .pipe(take(1))
        .subscribe((resultado) => {
          if (!resultado.exito) {
            return;
          }
          this.provisionalidades.update((actual) => {
            const copia = [...actual];
            if (copia[index]?.id === item.id) {
              copia[index] = { ...copia[index], tiempoTotal: resultado.tiempo };
            }
            return copia;
          });
          this.recalcularSumaProvisionalidades();
        });
    });
  }

  private escucharFormularioTitular(): void {
    this.formularioTitular.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actualizarPuedeGuardarTitularidad());

    this.formularioTitular.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.usuarioEditoTitular.set(true);
        this.solicitarRecalculoTitular();
      });

    this.actualizarPuedeGuardarTitularidad();
  }

  private actualizarPuedeGuardarTitularidad(): void {
    const v = this.formularioTitular.getRawValue();
    const cargoPermitido = this.cargosTitular().some((c) => c.id === v.cargoTitularId);
    this.puedeGuardarTitularidad.set(
      !!v.distritoJudicialId?.trim() &&
        cargoPermitido &&
        !!v.fechaJuramentacion &&
        !!v.horaJuramento?.trim() &&
        !!v.primeraEspecialidadId?.trim()
    );
  }

  private escucharFormularioPeriodo(): void {
    this.formularioPeriodo.controls.fechaInicio.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((inicio) => {
        const fin = this.formularioPeriodo.controls.fechaFin.value;
        const finCorregida = corregirFechaFinSiAnteriorAInicio(inicio, fin);
        if (finCorregida !== fin) {
          this.formularioPeriodo.controls.fechaFin.setValue(finCorregida, {
            emitEvent: true,
          });
        }
        this.actualizarErrorRangoPeriodo();
      });

    this.formularioPeriodo.controls.fechaFin.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actualizarErrorRangoPeriodo());

    this.formularioPeriodo.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.usuarioEditoPeriodo.set(true);
        this.solicitarRecalculoPeriodo();
      });
  }

  private actualizarErrorRangoPeriodo(): void {
    const inicio = this.formularioPeriodo.controls.fechaInicio.value;
    const finCtrl = this.formularioPeriodo.controls.fechaFin;
    const fin = finCtrl.value;

    if (inicio && fin && esFechaAnterior(fin, inicio)) {
      finCtrl.setErrors({ ...(finCtrl.errors ?? {}), fechaAnteriorAInicio: true });
      return;
    }

    if (finCtrl.hasError('fechaAnteriorAInicio')) {
      finCtrl.updateValueAndValidity({ emitEvent: false });
    }
  }

  private calcularTiempoTitular$() {
    if (this.hidratandoRubro) {
      return EMPTY;
    }

    const raw = this.formularioTitular.getRawValue();
    const juramentacion = raw.fechaJuramentacion
      ? aFechaIsoLocal(raw.fechaJuramentacion)
      : '';
    const valoracion = this.fechaValoracion()?.slice(0, 10) ?? '';

    if (!juramentacion || !valoracion) {
      this.calculandoTitular.set(false);
      return of(TIEMPO_SERVICIO_CERO);
    }

    this.calculandoTitular.set(true);
    return this.calcularTiempo
      .ejecutarTiempoTitular({
        fechaJuramentacion: juramentacion,
        fechaCese: raw.fechaCese ? aFechaIsoLocal(raw.fechaCese) : null,
        fechaReincorporacion: raw.fechaReincorporacion
          ? aFechaIsoLocal(raw.fechaReincorporacion)
          : null,
        fechaValoracion: valoracion,
      })
      .pipe(
        map((resultado) => (resultado.exito ? resultado.tiempo : TIEMPO_SERVICIO_CERO)),
        finalize(() => this.calculandoTitular.set(false))
      );
  }

  private calcularTiempoPeriodo$() {
    if (this.hidratandoRubro) {
      return EMPTY;
    }

    const raw = this.formularioPeriodo.getRawValue();
    if (!raw.fechaInicio || !raw.fechaFin) {
      this.calculandoPeriodo.set(false);
      return of(TIEMPO_SERVICIO_CERO);
    }

    this.calculandoPeriodo.set(true);
    return this.calcularTiempo
      .ejecutarEntreFechas(
        aFechaIsoLocal(raw.fechaInicio),
        aFechaIsoLocal(raw.fechaFin)
      )
      .pipe(
        map((resultado) => (resultado.exito ? resultado.tiempo : TIEMPO_SERVICIO_CERO)),
        finalize(() => this.calculandoPeriodo.set(false))
      );
  }

  private actualizarPuntaje(tiempo: TiempoServicio): void {
    this.calcularPuntaje
      .ejecutar(tiempo)
      .pipe(take(1))
      .subscribe((resultado) => {
        this.puntajeTitular.set(resultado.exito ? resultado.puntaje : 0);
      });
  }

  private recalcularSumaProvisionalidades(): void {
    if (this.hidratandoRubro) {
      return;
    }

    const tiempos = this.provisionalidades().map((p) => p.tiempoTotal);
    this.calcularTiempo
      .sumar(tiempos)
      .pipe(take(1))
      .subscribe((resultado) => {
        this.sumaProvisionalidades.set(
          resultado.exito ? resultado.tiempo : TIEMPO_SERVICIO_CERO
        );
      });
  }

  private recalcularAniosColegiaturas(): void {
    if (this.hidratandoRubro) {
      return;
    }

    const valoracion = this.fechaValoracion()?.slice(0, 10) ?? '';
    const lista = this.colegiaturas();
    if (!valoracion || !lista.length) {
      return;
    }

    lista.forEach((item) => {
      this.calcularAniosColegiatura
        .ejecutar(item.fechaColegiatura, valoracion)
        .pipe(take(1))
        .subscribe((resultado) => {
          if (!resultado.exito) {
            return;
          }
          this.colegiaturas.update((actual) =>
            actual.map((c) =>
              c.id === item.id ? { ...c, anios: resultado.anios } : c
            )
          );
        });
    });
  }
}
