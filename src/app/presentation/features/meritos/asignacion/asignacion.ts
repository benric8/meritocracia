import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { AsignarSuplenciaUseCase } from '../../../../application/use-cases/suplencias/asignar-suplencia.use-case';
import { ListarMotivosSuplenciaUseCase } from '../../../../application/use-cases/suplencias/listar-motivos-suplencia.use-case';
import { ListarRegistradoresSuplentesUseCase } from '../../../../application/use-cases/suplencias/listar-registradores-suplentes.use-case';
import { ListarSuplenciasUseCase } from '../../../../application/use-cases/suplencias/listar-suplencias.use-case';
import { RetirarSuplenciaUseCase } from '../../../../application/use-cases/suplencias/retirar-suplencia.use-case';
import { ResultadoPaginado } from '../../../../domain/models/paginacion.model';
import {
  FichaSuplencia,
  FiltrosSuplencias,
  MotivoSuplencia,
  RegistradorSuplente,
} from '../../../../domain/models/suplencia.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { formatearFechaCorta } from '../fecha/fecha-valoracion.util';
import { soloDigitosDni } from '../registro/ficha-valoracion.util';
import {
  aplicarReglaMotivo,
  crearFormularioFila,
  escaparHtml,
  etiquetaRegistrador,
  fichaConSuplenciaAsignada,
  fichaSinSuplencia,
  FormFilaSuplencia,
  puedeGuardarFila,
  registradoresParaFila,
  resolverAccionGuardar,
  restablecerFila,
  ValoresFilaSuplencia,
  valoresDesdeFicha,
} from './asignacion-fila.util';

type EstadoSuplenciaFiltro = 'TODOS' | 'CON' | 'SIN';

/** Estado de una fila de la bandeja: formulario reactivo propio + valores originales. */
interface FilaSuplencia {
  ficha: FichaSuplencia;
  form: FormFilaSuplencia;
  originales: ValoresFilaSuplencia;
  opcionesSuplente: RegistradorSuplente[];
  guardando: WritableSignal<boolean>;
  puedeGuardar: WritableSignal<boolean>;
}

/**
 * Asignación de registrador suplente (solo Administrador).
 * Ruta: `/meritos/asignacion-registrador`.
 */
@Component({
  selector: 'app-asignacion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './asignacion.html',
  styleUrl: './asignacion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Asignacion implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarSuplencias = inject(ListarSuplenciasUseCase);
  private readonly listarRegistradores = inject(ListarRegistradoresSuplentesUseCase);
  private readonly listarMotivos = inject(ListarMotivosSuplenciaUseCase);
  private readonly asignarSuplencia = inject(AsignarSuplenciaUseCase);
  private readonly retirarSuplencia = inject(RetirarSuplenciaUseCase);

  /** Suscripciones de los formularios de la página actual; se renuevan al recargar. */
  private suscripcionesFilas = new Subscription();

  protected readonly registradores = signal<RegistradorSuplente[]>([]);
  protected readonly motivos = signal<MotivoSuplencia[]>([]);
  protected readonly filas = signal<FilaSuplencia[]>([]);
  protected readonly paginaActual = signal(1);
  protected readonly tamanioPagina = signal(10);
  protected readonly totalRegistros = signal(0);
  protected readonly opcionesTamanioPagina = [5, 10, 20, 50];
  protected readonly cargando = signal(false);

  protected readonly etiquetaRegistrador = etiquetaRegistrador;
  protected readonly formatearFecha = formatearFechaCorta;

  protected readonly filtros = this.fb.group({
    registradorTitularId: this.fb.control<number | null>(null),
    dni: this.fb.nonNullable.control(''),
    estadoSuplencia: this.fb.nonNullable.control<EstadoSuplenciaFiltro>('TODOS'),
  });
  /** Filtros con los que se consultó por última vez (paginación y recargas). */
  private filtrosAplicados: FiltrosSuplencias = this.leerFiltros();

  constructor() {
    this.destroyRef.onDestroy(() => this.suscripcionesFilas.unsubscribe());
  }

  ngOnInit(): void {
    this.cargarInicial();
  }

  protected onDniInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalizado = soloDigitosDni(input.value);
    if (input.value !== normalizado) {
      input.value = normalizado;
    }
    this.filtros.controls.dni.setValue(normalizado, { emitEvent: false });
  }

  protected onBuscar(event?: Event): void {
    event?.preventDefault();
    this.filtrosAplicados = this.leerFiltros();
    this.cargar(1);
  }

  protected onLimpiar(): void {
    this.filtros.reset({ registradorTitularId: null, dni: '', estadoSuplencia: 'TODOS' });
    this.onBuscar();
  }

  protected onPaginaCambiada(evento: PageEvent): void {
    this.tamanioPagina.set(evento.pageSize);
    this.cargar(evento.pageIndex + 1);
  }

  protected motivoRequeridoSinElegir(fila: FilaSuplencia): boolean {
    const motivo = fila.form.controls.motivo;
    return motivo.enabled && motivo.hasError('required') && (motivo.touched || fila.form.dirty);
  }

  protected async onGuardar(fila: FilaSuplencia): Promise<void> {
    if (fila.guardando()) {
      return;
    }

    fila.form.markAllAsTouched();
    const accion = resolverAccionGuardar(fila.form, fila.originales);
    if (accion.tipo === 'NINGUNA' || fila.form.invalid) {
      this.actualizarPuedeGuardar(fila);
      return;
    }

    const magistrado = escaparHtml(fila.ficha.nombreMagistrado);

    if (accion.tipo === 'ASIGNAR') {
      const suplente = this.registradores().find((r) => r.id === accion.suplenteId);
      const motivo = this.motivos().find((m) => m.codigo === accion.motivo);
      const confirmado = await this.alertas.confirmar({
        icono: 'question',
        titulo: 'Asignar suplente',
        html:
          `¿Asignar a <strong>${escaparHtml(suplente?.nombreCompleto ?? '')}</strong> como suplente ` +
          `de la ficha de <strong>${magistrado}</strong> por ` +
          `<strong>${escaparHtml(motivo?.descripcion ?? accion.motivo)}</strong>?`,
        textoConfirmar: 'Asignar',
      });

      if (!confirmado) {
        this.revertir(fila);
        return;
      }

      this.iniciarGuardado(fila);
      this.asignarSuplencia
        .ejecutar(fila.ficha.fichaId, accion.suplenteId, accion.motivo)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.terminarGuardado(fila))
        )
        .subscribe((resultado) => {
          if (!resultado.exito) {
            this.revertir(fila);
            void this.alertas.error('No se pudo asignar la suplencia', resultado.detalle);
            return;
          }

          fila.ficha = fichaConSuplenciaAsignada(
            fila.ficha,
            resultado.suplencia,
            this.registradores()
          );
          fila.originales = valoresDesdeFicha(fila.ficha);
          void this.alertas.exito(
            'Suplencia asignada',
            `${fila.ficha.nombreRegistradorSuplente ?? 'El registrador'} fue asignado como suplente de la ficha de ${fila.ficha.nombreMagistrado}.`
          );
        });
      return;
    }

    const suplenteActual = escaparHtml(
      fila.ficha.nombreRegistradorSuplente ??
        this.registradores().find((r) => r.id === fila.originales.suplenteId)?.nombreCompleto ??
        'El suplente'
    );
    const confirmado = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Retirar suplencia',
      html: `¿Retirar la suplencia? <strong>${suplenteActual}</strong> perderá el acceso a la ficha de <strong>${magistrado}</strong>.`,
      textoConfirmar: 'Retirar',
    });

    if (!confirmado) {
      this.revertir(fila);
      return;
    }

    this.iniciarGuardado(fila);
    this.retirarSuplencia
      .ejecutar(fila.ficha.fichaId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.terminarGuardado(fila))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          this.revertir(fila);
          void this.alertas.error('No se pudo retirar la suplencia', resultado.detalle);
          return;
        }

        fila.ficha = fichaSinSuplencia(fila.ficha);
        fila.originales = valoresDesdeFicha(fila.ficha);
        void this.alertas.exito(
          'Suplencia retirada',
          `Se retiró la suplencia de la ficha de ${fila.ficha.nombreMagistrado}.`
        );
      });
  }

  private iniciarGuardado(fila: FilaSuplencia): void {
    fila.guardando.set(true);
    fila.puedeGuardar.set(false);
    fila.form.disable({ emitEvent: false });
  }

  /** Reactiva la fila respetando la regla del motivo y el estado (ya actualizado o revertido). */
  private terminarGuardado(fila: FilaSuplencia): void {
    fila.guardando.set(false);
    // `finalize` corre después de `next`: `originales` ya refleja el éxito o la fila ya se revirtió.
    restablecerFila(fila.form, fila.originales);
    this.actualizarPuedeGuardar(fila);
  }

  private revertir(fila: FilaSuplencia): void {
    restablecerFila(fila.form, fila.originales);
    this.actualizarPuedeGuardar(fila);
  }

  private actualizarPuedeGuardar(fila: FilaSuplencia): void {
    fila.puedeGuardar.set(!fila.guardando() && puedeGuardarFila(fila.form, fila.originales));
  }

  private leerFiltros(): FiltrosSuplencias {
    const { registradorTitularId, dni, estadoSuplencia } = this.filtros.getRawValue();
    return {
      registradorTitularId: registradorTitularId ?? null,
      dni,
      conSuplente: estadoSuplencia === 'TODOS' ? null : estadoSuplencia === 'CON',
    };
  }

  /** Bandeja, registradores y motivos en paralelo; los catálogos se cargan una sola vez. */
  private cargarInicial(): void {
    this.cargando.set(true);

    forkJoin({
      registradores: this.listarRegistradores.ejecutar(),
      motivos: this.listarMotivos.ejecutar(),
      pagina: this.listarSuplencias.ejecutar(this.filtrosAplicados, {
        pagina: 1,
        tamanio: this.tamanioPagina(),
      }),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: ({ registradores, motivos, pagina }) => {
          this.registradores.set(registradores);
          this.motivos.set(motivos);
          this.aplicarPagina(pagina, 1);
        },
        // El interceptor global ya notifica el error del GET.
        error: () => this.aplicarPagina(null, 1),
      });
  }

  private cargar(pagina = this.paginaActual()): void {
    const tamanio = this.tamanioPagina();
    this.cargando.set(true);

    this.listarSuplencias
      .ejecutar(this.filtrosAplicados, { pagina, tamanio })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (resultado) => {
          this.aplicarPagina(resultado, pagina);
          if (resultado.elementos.length === 0 && resultado.totalRegistros > 0 && pagina > 1) {
            this.cargar(pagina - 1);
          }
        },
        error: () => this.aplicarPagina(null, pagina),
      });
  }

  private aplicarPagina(resultado: ResultadoPaginado<FichaSuplencia> | null, pagina: number): void {
    this.suscripcionesFilas.unsubscribe();
    this.suscripcionesFilas = new Subscription();

    this.filas.set((resultado?.elementos ?? []).map((ficha) => this.crearFila(ficha)));
    this.totalRegistros.set(resultado?.totalRegistros ?? 0);
    this.paginaActual.set(resultado?.paginaActual || pagina);
  }

  private crearFila(ficha: FichaSuplencia): FilaSuplencia {
    const originales = valoresDesdeFicha(ficha);
    const fila: FilaSuplencia = {
      ficha,
      form: crearFormularioFila(originales),
      originales,
      opcionesSuplente: registradoresParaFila(this.registradores(), ficha.registradorTitularId),
      guardando: signal(false),
      puedeGuardar: signal(false),
    };

    this.suscripcionesFilas.add(
      fila.form.controls.suplenteId.valueChanges.subscribe(() => aplicarReglaMotivo(fila.form))
    );
    this.suscripcionesFilas.add(
      fila.form.valueChanges.subscribe(() => this.actualizarPuedeGuardar(fila))
    );

    return fila;
  }
}
