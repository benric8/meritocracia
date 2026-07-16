import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, finalize } from 'rxjs';
import { CalcularAniosColegiaturaUseCase } from '../../../../../../application/use-cases/meritos/calcular-anios-colegiatura.use-case';
import { CalcularPuntajeAntiguedadUseCase } from '../../../../../../application/use-cases/meritos/calcular-puntaje-antiguedad.use-case';
import { CalcularTiempoServicioUseCase } from '../../../../../../application/use-cases/meritos/calcular-tiempo-servicio.use-case';
import {
  CatalogosAntiguedad,
  ListarCatalogosAntiguedadUseCase,
} from '../../../../../../application/use-cases/meritos/listar-catalogos-antiguedad.use-case';
import { CatalogoItem } from '../../../../../../domain/models/catalogo-item.model';
import {
  Colegiatura,
  Provisionalidad,
} from '../../../../../../domain/models/rubro-antiguedad.model';
import {
  TIEMPO_SERVICIO_CERO,
  TiempoServicio,
} from '../../../../../../domain/models/tiempo-servicio.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import {
  aDateDesdeIso,
  aFechaIsoLocal,
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

  readonly fechaValoracion = input<string | null>(null);
  readonly puntajeChange = output<number>();

  protected readonly cargandoCatalogos = signal(false);
  protected readonly calculandoTitular = signal(false);
  protected readonly calculandoPeriodo = signal(false);
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

  protected readonly formularioTitular = this.fb.group({
    distritoJudicialId: this.fb.nonNullable.control(''),
    cargoTitularId: this.fb.nonNullable.control(''),
    fechaJuramentacion: this.fb.control<Date | null>(null),
    horaJuramento: this.fb.nonNullable.control(''),
    fechaCese: this.fb.control<Date | null>(null),
    fechaReincorporacion: this.fb.control<Date | null>(null),
    primeraEspecialidadId: this.fb.nonNullable.control(''),
    segundaEspecialidadId: this.fb.nonNullable.control(''),
  });

  protected readonly formularioPeriodo = this.fb.group({
    nivelInmediatoAnteriorId: this.fb.nonNullable.control(''),
    fechaInicio: this.fb.control<Date | null>(null),
    fechaFin: this.fb.control<Date | null>(null),
  });

  constructor() {
    effect(() => {
      // Recalcular cuando cambia la fecha de valoración vigente (input).
      this.fechaValoracion();
      this.recalcularTiempoTitular();
      this.recalcularAniosColegiaturas();
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.escucharFormularioTitular();
    this.escucharFormularioPeriodo();
  }

  protected abrirProvisionalidad(existente?: Provisionalidad): void {
    const data: FormularioProvisionalidadData = {
      cargos: this.cargosProvisional(),
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
    this.provisionalidades.update((lista) => lista.filter((p) => p.id !== id));
    this.recalcularSumaProvisionalidades();
  }

  protected abrirColegiatura(existente?: Colegiatura): void {
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
    this.colegiaturas.update((lista) => lista.filter((c) => c.id !== id));
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
  }

  private cargarCatalogos(): void {
    this.cargandoCatalogos.set(true);
    this.errorCatalogos.set(null);

    this.listarCatalogos
      .ejecutar()
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
        this.precargarValoresDemo(resultado.catalogos);
      });
  }

  private aplicarCatalogos(catalogos: CatalogosAntiguedad): void {
    this.distritos.set(catalogos.distritosJudiciales);
    this.cargosTitular.set(catalogos.cargosTitular);
    this.cargosProvisional.set(catalogos.cargosProvisional);
    this.especialidades.set(catalogos.especialidades);
    this.nivelesAnteriores.set(catalogos.nivelesInmediatosAnteriores);
    this.colegios.set(catalogos.colegiosAbogados);
  }

  /** Valores alineados al mockup para facilitar la demostración. */
  private precargarValoresDemo(catalogos: CatalogosAntiguedad): void {
    const distrito =
      catalogos.distritosJudiciales.find((d) => d.nombre === 'Huancavelica')?.id ??
      catalogos.distritosJudiciales[0]?.id ??
      '';
    const cargo =
      catalogos.cargosTitular.find((c) => c.nombre.includes('Superior'))?.id ??
      catalogos.cargosTitular[0]?.id ??
      '';
    const especialidad =
      catalogos.especialidades.find((e) => e.nombre === 'Civil')?.id ??
      catalogos.especialidades[0]?.id ??
      '';
    const nivelAnterior =
      catalogos.nivelesInmediatosAnteriores.find((n) => n.nombre === 'Especializado')?.id ??
      catalogos.nivelesInmediatosAnteriores[0]?.id ??
      '';
    const cargoProv =
      catalogos.cargosProvisional.find((c) => c.nombre.includes('SUPERIOR')) ??
      catalogos.cargosProvisional[0];
    const colegio =
      catalogos.colegiosAbogados.find((c) => c.nombre === 'LIMA') ??
      catalogos.colegiosAbogados[0];

    this.formularioTitular.patchValue(
      {
        distritoJudicialId: distrito,
        cargoTitularId: cargo,
        fechaJuramentacion: aDateDesdeIso('2013-04-09'),
        horaJuramento: '11:15',
        primeraEspecialidadId: especialidad,
        segundaEspecialidadId: '',
      },
      { emitEvent: true }
    );

    this.formularioPeriodo.patchValue(
      {
        nivelInmediatoAnteriorId: nivelAnterior,
        fechaInicio: aDateDesdeIso('2003-11-18'),
        fechaFin: aDateDesdeIso('2013-04-08'),
      },
      { emitEvent: true }
    );

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
        .pipe(takeUntilDestroyed(this.destroyRef))
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
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalcularTiempoTitular());
  }

  private escucharFormularioPeriodo(): void {
    this.formularioPeriodo.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalcularTiempoPeriodo());
  }

  private recalcularTiempoTitular(): void {
    const raw = this.formularioTitular.getRawValue();
    const juramentacion = raw.fechaJuramentacion
      ? aFechaIsoLocal(raw.fechaJuramentacion)
      : '';
    const valoracion = this.fechaValoracion()?.slice(0, 10) ?? '';

    if (!juramentacion || !valoracion) {
      this.tiempoTitular.set(TIEMPO_SERVICIO_CERO);
      this.actualizarPuntaje(TIEMPO_SERVICIO_CERO);
      return;
    }

    this.calculandoTitular.set(true);
    this.calcularTiempo
      .ejecutarTiempoTitular({
        fechaJuramentacion: juramentacion,
        fechaCese: raw.fechaCese ? aFechaIsoLocal(raw.fechaCese) : null,
        fechaReincorporacion: raw.fechaReincorporacion
          ? aFechaIsoLocal(raw.fechaReincorporacion)
          : null,
        fechaValoracion: valoracion,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.calculandoTitular.set(false))
      )
      .subscribe((resultado) => {
        const tiempo = resultado.exito ? resultado.tiempo : TIEMPO_SERVICIO_CERO;
        this.tiempoTitular.set(tiempo);
        this.actualizarPuntaje(tiempo);
      });
  }

  private actualizarPuntaje(tiempo: TiempoServicio): void {
    this.calcularPuntaje
      .ejecutar(tiempo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resultado) => {
        const puntaje = resultado.exito ? resultado.puntaje : 0;
        this.puntajeTitular.set(puntaje);
        this.puntajeChange.emit(puntaje);
      });
  }

  private recalcularTiempoPeriodo(): void {
    const raw = this.formularioPeriodo.getRawValue();
    if (!raw.fechaInicio || !raw.fechaFin) {
      this.tiempoPeriodo.set(TIEMPO_SERVICIO_CERO);
      return;
    }

    this.calculandoPeriodo.set(true);
    this.calcularTiempo
      .ejecutarEntreFechas(
        aFechaIsoLocal(raw.fechaInicio),
        aFechaIsoLocal(raw.fechaFin)
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.calculandoPeriodo.set(false))
      )
      .subscribe((resultado) => {
        this.tiempoPeriodo.set(
          resultado.exito ? resultado.tiempo : TIEMPO_SERVICIO_CERO
        );
      });
  }

  private recalcularSumaProvisionalidades(): void {
    const tiempos = this.provisionalidades().map((p) => p.tiempoTotal);
    this.calcularTiempo
      .sumar(tiempos)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resultado) => {
        this.sumaProvisionalidades.set(
          resultado.exito ? resultado.tiempo : TIEMPO_SERVICIO_CERO
        );
      });
  }

  private recalcularAniosColegiaturas(): void {
    const valoracion = this.fechaValoracion()?.slice(0, 10) ?? '';
    const lista = this.colegiaturas();
    if (!valoracion || !lista.length) {
      return;
    }

    lista.forEach((item) => {
      this.calcularAniosColegiatura
        .ejecutar(item.fechaColegiatura, valoracion)
        .pipe(takeUntilDestroyed(this.destroyRef))
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
