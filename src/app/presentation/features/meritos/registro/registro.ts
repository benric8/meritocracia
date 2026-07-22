import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { EMPTY, debounceTime, distinctUntilChanged, finalize, map, of, switchMap, take } from 'rxjs';
import { ActualizarDatosPersonalesFichaUseCase } from '../../../../application/use-cases/meritos/actualizar-datos-personales-ficha.use-case';
import { CalcularEdadJuezUseCase } from '../../../../application/use-cases/meritos/calcular-edad-juez.use-case';
import { CrearBorradorFichaUseCase } from '../../../../application/use-cases/meritos/crear-borrador-ficha.use-case';
import { ListarNivelesTitularUseCase } from '../../../../application/use-cases/meritos/listar-niveles-titular.use-case';
import { ObtenerDatosSigaJuezUseCase } from '../../../../application/use-cases/meritos/obtener-datos-siga-juez.use-case';
import { ObtenerFechaValoracionVigenteUseCase } from '../../../../application/use-cases/meritos/obtener-fecha-valoracion-vigente.use-case';
import { ObtenerFichaUseCase } from '../../../../application/use-cases/meritos/obtener-ficha.use-case';
import { ResolverFichaDelCicloUseCase } from '../../../../application/use-cases/meritos/resolver-ficha-del-ciclo.use-case';
import {
  EstadoFicha,
  FichaValoracion,
} from '../../../../domain/models/ficha-valoracion.model';
import { RubroAntiguedad } from '../../../../domain/models/rubro-antiguedad.model';
import { RubroGradosTitulos } from '../../../../domain/models/rubro-grados-titulos.model';
import { RubroAmag } from '../../../../domain/models/rubro-amag.model';
import { NivelTitular } from '../../../../domain/models/nivel-titular.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import {
  aFechaIsoLocal,
  maxFechaNacimientoPorEdadMinima,
  mensajeErrorCampoDatosPersonales,
  OPCIONES_SEXO,
  soloDigitosDni,
  VALIDADORES_DNI,
  VALIDADORES_FECHA_NACIMIENTO,
  VALIDADORES_NIVEL,
  VALIDADORES_NOMBRE_COMPLETO,
  VALIDADORES_SEXO,
} from './ficha-valoracion.util';
import { formatearFechaCorta } from '../fecha/fecha-valoracion.util';
import { RubrosMaestroStore } from '../../../../infrastructure/stores/rubros-maestro.store';
import { RubrosPanel } from './rubros/rubros-panel/rubros-panel';
import { aDateDesdeIso, formatearPuntaje } from './rubros/rubros.util';

/** Acción principal de cabecera según el resultado de Buscar. */
export type ModoAccionCabecera = 'NUEVA' | 'ACTUALIZAR' | 'IMPORTAR' | 'BLOQUEADA';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    RubrosPanel,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registro implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarNiveles = inject(ListarNivelesTitularUseCase);
  private readonly obtenerDatosSiga = inject(ObtenerDatosSigaJuezUseCase);
  private readonly calcularEdad = inject(CalcularEdadJuezUseCase);
  private readonly obtenerFechaVigente = inject(ObtenerFechaValoracionVigenteUseCase);
  private readonly resolverFicha = inject(ResolverFichaDelCicloUseCase);
  private readonly crearBorrador = inject(CrearBorradorFichaUseCase);
  private readonly actualizarDatosPersonales = inject(ActualizarDatosPersonalesFichaUseCase);
  private readonly obtenerFicha = inject(ObtenerFichaUseCase);
  private readonly rubrosMaestroStore = inject(RubrosMaestroStore);

  protected readonly niveles = signal<NivelTitular[]>([]);
  protected readonly cargandoNiveles = signal(false);
  protected readonly buscandoDni = signal(false);
  protected readonly calculandoEdad = signal(false);
  protected readonly guardandoFicha = signal(false);
  protected readonly fotoSiga = signal<string>('');
  protected readonly edad = signal<string>('');
  protected readonly fechaValoracionVigente = signal<string | null>(null);
  protected readonly fechaValoracionId = signal<string | null>(null);
  protected readonly fichaId = signal<string | null>(null);
  protected readonly nivelIdFicha = signal<string | null>(null);
  protected readonly fichaEstado = signal<EstadoFicha | null>(null);
  protected readonly puntajeTotal = signal(0);
  protected readonly rubrosDesbloqueados = signal(false);
  protected readonly fichaSoloLectura = signal(false);
  protected readonly rubroAntiguedad = signal<RubroAntiguedad | null>(null);
  protected readonly rubroGradosTitulos = signal<RubroGradosTitulos | null>(null);
  protected readonly rubroAmag = signal<RubroAmag | null>(null);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly rubrosMaestro = this.rubrosMaestroStore.rubros;
  protected readonly cargandoRubrosMaestro = this.rubrosMaestroStore.cargando;
  protected readonly rubroInicioEtiqueta = computed(() => {
    const primero = this.rubrosMaestro().find((rubro) => rubro.tieneDetalle);
    return primero
      ? `el rubro ${primero.codigo} — ${primero.nombre}`
      : 'el rubro B — Antigüedad en el cargo';
  });
  protected readonly formatearPuntaje = formatearPuntaje;

  /**
   * Modo de la acción principal tras Buscar.
   * `null` = aún no se resolvió el DNI.
   */
  protected readonly modoAccionCabecera = signal<ModoAccionCabecera | null>(null);
  /** Ficha del proceso anterior a importar (solo modo IMPORTAR). */
  protected readonly fichaPreviaId = signal<string | null>(null);
  /** DNI para el que ya se ejecutó Buscar (resolver + SIGA si aplica). */
  private readonly dniResuelto = signal<string>('');
  /** DNI con foto/nombre cargados (SIGA o ficha existente). */
  private readonly dniConsultadoIdentidad = signal<string>('');

  protected readonly etiquetaBotonPrincipal = computed(() => {
    switch (this.modoAccionCabecera()) {
      case 'ACTUALIZAR':
        return 'Actualizar';
      case 'IMPORTAR':
        return 'Importar ficha anterior';
      case 'BLOQUEADA':
        return 'Ficha cerrada';
      case 'NUEVA':
      default:
        return 'Guardar';
    }
  });

  protected readonly iconoBotonPrincipal = computed(() => {
    switch (this.modoAccionCabecera()) {
      case 'ACTUALIZAR':
        return 'sync';
      case 'IMPORTAR':
        return 'content_copy';
      case 'BLOQUEADA':
        return 'lock';
      case 'NUEVA':
      default:
        return 'save';
    }
  });

  protected readonly mensajeEstadoBusqueda = computed(() => {
    switch (this.modoAccionCabecera()) {
      case 'NUEVA':
        return 'Nuevo registro: complete los datos y pulse Guardar.';
      case 'ACTUALIZAR':
        return 'Se encontró un registro del proceso actual. Puede actualizar los datos personales.';
      case 'IMPORTAR':
        return 'Existe una ficha del proceso anterior. Pulse Importar ficha anterior para crear el borrador del ciclo vigente.';
      case 'BLOQUEADA':
        return 'La ficha del proceso actual está cerrada y se muestra en solo lectura.';
      default:
        return null;
    }
  });

  /** Fecha máxima de nacimiento: edad actual >= 20 años. */
  protected readonly maxFechaNacimiento = maxFechaNacimientoPorEdadMinima();
  /** Abre el selector de años cerca del límite válido. */
  protected readonly fechaNacimientoInicio = this.maxFechaNacimiento;
  /** Excluye fechas cuya edad a hoy sería menor de 20 años. */
  protected readonly filtroFechaNacimiento = (fecha: Date | null): boolean => {
    if (!fecha) {
      return false;
    }

    const candidata = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    return candidata.getTime() <= this.maxFechaNacimiento.getTime();
  };

  protected readonly opcionesSexo = OPCIONES_SEXO;
  protected readonly mensajeErrorCampo = mensajeErrorCampoDatosPersonales;
  protected readonly formatearFecha = formatearFechaCorta;

  protected readonly formulario = this.fb.group({
    dni: this.fb.nonNullable.control('', VALIDADORES_DNI),
    nivelId: this.fb.nonNullable.control('', VALIDADORES_NIVEL),
    nombreCompleto: this.fb.nonNullable.control('', VALIDADORES_NOMBRE_COMPLETO),
    fechaNacimiento: this.fb.control<Date | null>(null, VALIDADORES_FECHA_NACIMIENTO),
    sexo: this.fb.nonNullable.control('', VALIDADORES_SEXO),
  });

  ngOnInit(): void {
    this.cargarNiveles();
    this.cargarRubrosMaestro();
    this.cargarFechaValoracionVigente();
    this.escucharFechaNacimiento();
  }

  protected onDniInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalizado = soloDigitosDni(input.value);
    if (input.value !== normalizado) {
      input.value = normalizado;
    }
    this.formulario.controls.dni.setValue(normalizado, { emitEvent: false });
    this.sincronizarResolucionConDni(normalizado);
  }

  /** True si el DNI actual ya fue resuelto con Buscar. */
  protected dniYaResuelto(): boolean {
    const dni = this.formulario.controls.dni.value;
    return !!dni && dni === this.dniResuelto() && this.modoAccionCabecera() != null;
  }

  /**
   * Lupa o Enter: primero resuelve ficha del ciclo (borrador / previa).
   * Solo si es registro nuevo consulta SIGA.
   */
  protected onBuscarDni(event?: Event): void {
    event?.preventDefault();

    if (this.buscandoDni() || this.guardandoFicha() || this.dniYaResuelto()) {
      return;
    }

    const dniControl = this.formulario.controls.dni;
    dniControl.markAsTouched();
    if (dniControl.invalid) {
      return;
    }

    const fechaValoracionId = this.fechaValoracionId();
    if (!fechaValoracionId) {
      void this.alertas.error('Sin fecha de valoración', {
        mensaje:
          'No hay una fecha de valoración vigente. Configure una antes de buscar el DNI.',
      });
      return;
    }

    const dni = dniControl.value;
    this.buscandoDni.set(true);
    this.resetEstadoTrasCambioDni(false);

    this.resolverFicha
      .ejecutar(dni, fechaValoracionId)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        switchMap((resolucion) => {
          if (!resolucion.exito) {
            void this.alertas.error('No se pudo resolver la ficha', {
              mensaje:
                resolucion.detalle?.mensaje ??
                resolucion.mensaje ??
                'Error desconocido.',
              codigo: resolucion.detalle?.codigo,
              codigoOperacion: resolucion.detalle?.codigoOperacion,
            });
            return EMPTY;
          }

          const resultado = resolucion.resultado;

          if (resultado.tipo === 'ASIGNADO_A_OTRO') {
            return of({
              tipo: 'ASIGNADO_A_OTRO' as const,
              fichaId: resultado.fichaId,
            });
          }

          if (resultado.tipo === 'EDITABLE' || resultado.tipo === 'BLOQUEADA') {
            return this.obtenerFicha.ejecutar(resultado.fichaId).pipe(
              map((obtencion) => ({
                tipo: resultado.tipo,
                fichaId: resultado.fichaId,
                obtencion,
              }))
            );
          }

          if (resultado.tipo === 'NUEVA_CON_PREVIA') {
            return this.obtenerDatosSiga.ejecutar(dni).pipe(
              map((siga) => ({
                tipo: 'NUEVA_CON_PREVIA' as const,
                siga,
                dni,
                fichaPreviaId: resultado.fichaPreviaId,
              }))
            );
          }

          return this.obtenerDatosSiga.ejecutar(dni).pipe(
            map((siga) => ({
              tipo: 'NUEVA' as const,
              siga,
              dni,
            }))
          );
        }),
        finalize(() => this.buscandoDni.set(false))
      )
      .subscribe(async (evento) => {
        if (this.formulario.controls.dni.value !== dni) {
          return;
        }

        if (evento.tipo === 'ASIGNADO_A_OTRO') {
          this.resetEstadoTrasCambioDni(true);
          void this.alertas.error('Ficha asignada a otro registrador', {
            mensaje:
              'Este magistrado ya tiene una ficha del ciclo vigente asignada a otro registrador. No puede editarla.',
          });
          return;
        }

        if (evento.tipo === 'NUEVA' || evento.tipo === 'NUEVA_CON_PREVIA') {
          if (!evento.siga.exito) {
            this.limpiarIdentidad();
            void this.alertas.error('No se encontró en SIGA', {
              mensaje:
                evento.siga.detalle?.mensaje ??
                evento.siga.mensaje ??
                'Error desconocido.',
              codigo: evento.siga.detalle?.codigo,
              codigoOperacion: evento.siga.detalle?.codigoOperacion,
            });
            return;
          }

          this.dniResuelto.set(dni);
          this.dniConsultadoIdentidad.set(dni);
          this.formulario.controls.nombreCompleto.setValue(evento.siga.datos.nombreCompleto);
          this.formulario.controls.nombreCompleto.disable({ emitEvent: false });
          this.fotoSiga.set(evento.siga.datos.foto);

          if (evento.tipo === 'NUEVA') {
            this.modoAccionCabecera.set('NUEVA');
            this.fichaPreviaId.set(null);
            return;
          }

          this.modoAccionCabecera.set('IMPORTAR');
          this.fichaPreviaId.set(evento.fichaPreviaId);
          await this.alertas.exito(
            'Ficha del proceso anterior',
            'Se encontraron datos del proceso anterior. Complete nivel y datos personales, luego pulse Importar ficha anterior.'
          );
          return;
        }

        if (!evento.obtencion.exito) {
          this.dniResuelto.set(dni);
          this.fichaId.set(evento.fichaId);
          this.modoAccionCabecera.set(
            evento.tipo === 'EDITABLE' ? 'ACTUALIZAR' : 'BLOQUEADA'
          );
          void this.alertas.error(
            evento.tipo === 'EDITABLE' ? 'Ficha encontrada' : 'Ficha no editable',
            {
              mensaje:
                evento.obtencion.detalle?.mensaje ??
                evento.obtencion.mensaje ??
                'La ficha existe, pero aún no se puede cargar el detalle completo desde el API.',
              codigo: evento.obtencion.detalle?.codigo,
              codigoOperacion: evento.obtencion.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const ficha = evento.obtencion.ficha;
        this.dniResuelto.set(dni);

        if (evento.tipo === 'EDITABLE') {
          this.modoAccionCabecera.set('ACTUALIZAR');
          this.fichaPreviaId.set(null);
          this.aplicarFichaEnUi(ficha, false);
          await this.alertas.exito(
            'Registro encontrado',
            'Se cargó el borrador del proceso actual. Puede actualizar los datos o continuar con los rubros.'
          );
          return;
        }

        if (evento.tipo === 'BLOQUEADA') {
          this.modoAccionCabecera.set('BLOQUEADA');
          this.fichaPreviaId.set(null);
          this.aplicarFichaEnUi(ficha, true);
          void this.alertas.error('Ficha cerrada', {
            mensaje:
              'La ficha del ciclo vigente está completada y se muestra en solo lectura.',
          });
        }
      });
  }

  protected onLimpiarDatosPersonales(): void {
    this.formulario.reset({
      dni: '',
      nivelId: '',
      nombreCompleto: '',
      fechaNacimiento: null,
      sexo: '',
    });
    this.resetEstadoTrasCambioDni(true);
    this.formulario.enable({ emitEvent: false });
  }

  /**
   * Acción principal según el modo resuelto en Buscar.
   * No vuelve a consultar el resolver: usa el resultado ya determinado.
   */
  protected onAccionCabecera(): void {
    const modo = this.modoAccionCabecera();
    if (!modo || modo === 'BLOQUEADA' || this.guardandoFicha() || this.fichaSoloLectura()) {
      return;
    }

    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      void this.alertas.error('Datos incompletos', {
        mensaje: 'Complete los datos personales del juez antes de continuar.',
      });
      return;
    }

    const fechaValoracionId = this.fechaValoracionId();
    const fechaValoracionSnapshot = this.fechaValoracionVigente();
    if (!fechaValoracionId || !fechaValoracionSnapshot) {
      void this.alertas.error('Sin fecha de valoración', {
        mensaje:
          'No hay una fecha de valoración vigente. Configure una antes de crear la ficha.',
      });
      return;
    }

    if (modo === 'ACTUALIZAR') {
      const id = this.fichaId();
      if (!id) {
        void this.alertas.error('Sin ficha', {
          mensaje: 'No hay una ficha cargada para actualizar. Vuelva a buscar el DNI.',
        });
        return;
      }
      this.ejecutarActualizacion(id);
      return;
    }

    const arrastrarDesde = modo === 'IMPORTAR' ? this.fichaPreviaId() : null;
    if (modo === 'IMPORTAR' && !arrastrarDesde) {
      void this.alertas.error('Sin ficha previa', {
        mensaje: 'No se identificó la ficha del proceso anterior. Vuelva a buscar el DNI.',
      });
      return;
    }

    this.ejecutarCreacionBorrador(fechaValoracionId, fechaValoracionSnapshot, arrastrarDesde);
  }

  private ejecutarActualizacion(fichaId: string): void {
    this.guardandoFicha.set(true);
    this.persistirActualizacion(fichaId)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardandoFicha.set(false))
      )
      .subscribe(async (guardado) => {
        if (!guardado.exito) {
          void this.alertas.error('No se pudieron guardar los datos', {
            mensaje:
              guardado.detalle?.mensaje ?? guardado.mensaje ?? 'Error desconocido.',
            codigo: guardado.detalle?.codigo,
            codigoOperacion: guardado.detalle?.codigoOperacion,
          });
          return;
        }
        this.aplicarFichaEnUi(guardado.ficha, false);
        this.modoAccionCabecera.set('ACTUALIZAR');
        await this.alertas.exito(
          'Datos actualizados',
          'Los datos personales se guardaron correctamente.'
        );
      });
  }

  private ejecutarCreacionBorrador(
    fechaValoracionId: string,
    fechaValoracionSnapshot: string,
    arrastrarDesde: string | null
  ): void {
    this.guardandoFicha.set(true);
    this.persistirBorrador(fechaValoracionId, fechaValoracionSnapshot, arrastrarDesde)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardandoFicha.set(false))
      )
      .subscribe(async (guardado) => {
        if (!guardado.exito) {
          void this.alertas.error('No se pudo crear la ficha', {
            mensaje:
              guardado.detalle?.mensaje ?? guardado.mensaje ?? 'Error desconocido.',
            codigo: guardado.detalle?.codigo,
            codigoOperacion: guardado.detalle?.codigoOperacion,
          });
          return;
        }

        this.aplicarFichaEnUi(guardado.ficha, false);
        this.modoAccionCabecera.set('ACTUALIZAR');
        this.fichaPreviaId.set(null);

        const mensaje = arrastrarDesde
          ? 'Ficha importada del proceso anterior. Puede continuar con los rubros.'
          : 'Datos personales guardados. Puede continuar con el rubro B — Antigüedad.';
        await this.alertas.exito(
          arrastrarDesde ? 'Ficha importada' : 'Ficha en borrador',
          mensaje
        );
      });
  }

  private persistirBorrador(
    fechaValoracionId: string,
    fechaValoracionSnapshot: string,
    arrastrarDesde: string | null
  ) {
    const v = this.formulario.getRawValue();
    const nivel = this.niveles().find((n) => n.id === v.nivelId);
    const edadNum = this.edad() ? Number(this.edad()) : null;

    return this.crearBorrador.ejecutar({
      nivelId: v.nivelId,
      nivelNombre: nivel?.nombre ?? '',
      fechaValoracionId,
      fechaValoracionSnapshot,
      arrastrarDesdeFichaId: arrastrarDesde,
      datosPersonales: {
        dni: v.dni,
        nombreCompleto: v.nombreCompleto,
        foto: this.fotoSiga(),
        fechaNacimiento: v.fechaNacimiento ? aFechaIsoLocal(v.fechaNacimiento) : '',
        sexo: v.sexo as 'M' | 'F',
        edad: Number.isFinite(edadNum) ? edadNum : null,
      },
    });
  }

  private persistirActualizacion(fichaId: string) {
    const v = this.formulario.getRawValue();
    const nivel = this.niveles().find((n) => n.id === v.nivelId);
    const edadNum = this.edad() ? Number(this.edad()) : null;

    return this.actualizarDatosPersonales.ejecutar(fichaId, {
      nivelId: v.nivelId,
      nivelNombre: nivel?.nombre ?? '',
      datosPersonales: {
        dni: v.dni,
        nombreCompleto: v.nombreCompleto,
        foto: this.fotoSiga(),
        fechaNacimiento: v.fechaNacimiento ? aFechaIsoLocal(v.fechaNacimiento) : '',
        sexo: v.sexo as 'M' | 'F',
        edad: Number.isFinite(edadNum) ? edadNum : null,
      },
    });
  }

  private aplicarFichaEnUi(ficha: FichaValoracion, soloLectura: boolean): void {
    this.fichaId.set(ficha.id);
    this.nivelIdFicha.set(ficha.nivelId);
    this.fichaEstado.set(ficha.estado);
    this.puntajeTotal.set(ficha.puntajeTotal);
    this.rubroAntiguedad.set(ficha.rubroAntiguedad);
    this.rubroGradosTitulos.set(ficha.rubroGradosTitulos);
    this.rubroAmag.set(ficha.rubroAmag);
    this.rubrosDesbloqueados.set(true);
    this.fichaSoloLectura.set(soloLectura);

    if (ficha.fechaValoracionId) {
      this.fechaValoracionId.set(ficha.fechaValoracionId);
    }
    if (ficha.fechaValoracionSnapshot) {
      this.fechaValoracionVigente.set(ficha.fechaValoracionSnapshot);
    }

    this.formulario.patchValue(
      {
        dni: ficha.datosPersonales.dni,
        nivelId: ficha.nivelId,
        nombreCompleto: ficha.datosPersonales.nombreCompleto,
        sexo: ficha.datosPersonales.sexo,
        fechaNacimiento: aDateDesdeIso(ficha.datosPersonales.fechaNacimiento),
      },
      { emitEvent: true }
    );

    this.fotoSiga.set(ficha.datosPersonales.foto);
    this.dniConsultadoIdentidad.set(ficha.datosPersonales.dni);
    this.dniResuelto.set(ficha.datosPersonales.dni);
    if (ficha.datosPersonales.edad != null) {
      this.edad.set(String(ficha.datosPersonales.edad));
    }

    if (soloLectura) {
      this.formulario.disable({ emitEvent: false });
    } else {
      this.formulario.enable({ emitEvent: false });
      this.formulario.controls.nombreCompleto.disable({ emitEvent: false });
    }
  }

  protected onFichaActualizadaDesdeRubros(ficha: FichaValoracion): void {
    this.puntajeTotal.set(ficha.puntajeTotal);
    this.rubroAntiguedad.set(ficha.rubroAntiguedad);
    this.rubroGradosTitulos.set(ficha.rubroGradosTitulos);
    this.rubroAmag.set(ficha.rubroAmag);
    this.fichaEstado.set(ficha.estado);
  }

  protected onRubroAntiguedadCargado(rubro: RubroAntiguedad): void {
    this.rubroAntiguedad.set(rubro);
    this.puntajeTotal.set(rubro.titularidad.puntaje);
  }

  protected onRubroGradosTitulosCargado(rubro: RubroGradosTitulos): void {
    this.rubroGradosTitulos.set(rubro);
  }

  protected onRubroAmagCargado(rubro: RubroAmag): void {
    this.rubroAmag.set(rubro);
  }

  /** Si el DNI deja de coincidir con la búsqueda resuelta, limpia el estado. */
  private sincronizarResolucionConDni(dni: string): void {
    const resuelto = this.dniResuelto();
    if (!resuelto) {
      return;
    }

    if (!dni || dni !== resuelto) {
      this.resetEstadoTrasCambioDni(true);
    }
  }

  private resetEstadoTrasCambioDni(limpiarIdentidad: boolean): void {
    this.dniResuelto.set('');
    this.modoAccionCabecera.set(null);
    this.fichaPreviaId.set(null);
    this.fichaId.set(null);
    this.nivelIdFicha.set(null);
    this.fichaEstado.set(null);
    this.puntajeTotal.set(0);
    this.rubrosDesbloqueados.set(false);
    this.fichaSoloLectura.set(false);
    this.rubroAntiguedad.set(null);
    this.rubroGradosTitulos.set(null);
    this.rubroAmag.set(null);
    this.edad.set('');
    if (limpiarIdentidad) {
      this.limpiarIdentidad();
    }
  }

  private limpiarIdentidad(): void {
    this.dniConsultadoIdentidad.set('');
    this.fotoSiga.set('');
    this.formulario.controls.nombreCompleto.setValue('');
  }

  private cargarNiveles(): void {
    this.cargandoNiveles.set(true);
    this.errorCarga.set(null);

    this.listarNiveles
      .ejecutar()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoNiveles.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          this.errorCarga.set(
            resultado.detalle?.mensaje ??
              resultado.mensaje ??
              'No se pudo cargar el catálogo de niveles.'
          );
          this.niveles.set([]);
          return;
        }

        this.niveles.set(resultado.niveles);
      });
  }

  private cargarRubrosMaestro(): void {
    this.rubrosMaestroStore
      .asegurarCargado()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((exito) => {
        if (!exito) {
          const mensajeRubros = this.rubrosMaestroStore.error();
          if (mensajeRubros && !this.errorCarga()) {
            this.errorCarga.set(mensajeRubros);
          }
        }
      });
  }

  private cargarFechaValoracionVigente(): void {
    this.obtenerFechaVigente
      .ejecutar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (vigente) => {
          this.fechaValoracionVigente.set(vigente?.fechaValoracion ?? null);
          this.fechaValoracionId.set(vigente?.id ?? null);
        },
        error: () => {
          this.fechaValoracionVigente.set(null);
          this.fechaValoracionId.set(null);
        },
      });
  }

  private escucharFechaNacimiento(): void {
    this.formulario.controls.fechaNacimiento.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => prev?.getTime() === curr?.getTime()
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((fechaNacimiento) => {
        const iso = fechaNacimiento ? aFechaIsoLocal(fechaNacimiento) : '';
        this.solicitarEdad(iso);
      });
  }

  private solicitarEdad(fechaNacimiento: string): void {
    const nacimiento = fechaNacimiento?.trim() ?? '';
    if (!nacimiento) {
      this.edad.set('');
      return;
    }

    const fechaValoracion = this.fechaValoracionVigente();
    if (!fechaValoracion) {
      this.edad.set('');
      void this.alertas.error('Sin fecha de valoración', {
        mensaje:
          'No hay una fecha de valoración vigente. Configure una antes de calcular la edad.',
      });
      return;
    }

    this.calculandoEdad.set(true);

    this.calcularEdad
      .ejecutar(nacimiento, fechaValoracion)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.calculandoEdad.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          this.edad.set('');
          void this.alertas.error('No se pudo calcular la edad', {
            mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        this.edad.set(String(resultado.edad.edad));
      });
  }
}
