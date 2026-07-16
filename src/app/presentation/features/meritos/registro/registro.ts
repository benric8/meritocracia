import {
  ChangeDetectionStrategy,
  Component,
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
import { EMPTY, Subject, debounceTime, distinctUntilChanged, finalize, map, switchMap } from 'rxjs';
import { CalcularEdadJuezUseCase } from '../../../../application/use-cases/meritos/calcular-edad-juez.use-case';
import { ListarNivelesTitularUseCase } from '../../../../application/use-cases/meritos/listar-niveles-titular.use-case';
import { ObtenerDatosSigaJuezUseCase } from '../../../../application/use-cases/meritos/obtener-datos-siga-juez.use-case';
import { ObtenerFechaValoracionVigenteUseCase } from '../../../../application/use-cases/meritos/obtener-fecha-valoracion-vigente.use-case';
import { NivelTitular } from '../../../../domain/models/nivel-titular.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import {
  aFechaIsoLocal,
  DNI_LENGTH,
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

  protected readonly niveles = signal<NivelTitular[]>([]);
  protected readonly cargandoNiveles = signal(false);
  protected readonly buscandoSiga = signal(false);
  protected readonly calculandoEdad = signal(false);
  protected readonly fotoSiga = signal<string>('');
  protected readonly edad = signal<string>('');
  protected readonly fechaValoracionVigente = signal<string | null>(null);
  protected readonly errorCarga = signal<string | null>(null);
  /** DNI con el que se cargaron foto y nombre desde SIGA. */
  private readonly dniConsultadoSiga = signal<string>('');
  /**
   * Dispara búsqueda SIGA. `null` cancela la petición en curso;
   * `{ dni, forzar }` fuerza reintento aunque el DNI ya esté consultado.
   */
  private readonly solicitudSiga$ = new Subject<{ dni: string; forzar: boolean } | null>();
  /** Evita que `finalize` de una petición cancelada apague el spinner de la vigente. */
  private generacionBusquedaSiga = 0;

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
    this.cargarFechaValoracionVigente();
    this.escucharFechaNacimiento();
    this.escucharBusquedaSiga();
  }

  protected onDniInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalizado = soloDigitosDni(input.value);
    if (input.value !== normalizado) {
      input.value = normalizado;
    }
    this.formulario.controls.dni.setValue(normalizado, { emitEvent: false });
    this.sincronizarDatosSigaConDni(normalizado);
    this.intentarBusquedaSigaAutomatica(normalizado);
  }

  /** True si el DNI actual ya tiene foto/nombre cargados desde SIGA. */
  protected dniYaConsultadoSiga(): boolean {
    const dni = this.formulario.controls.dni.value;
    return !!dni && dni === this.dniConsultadoSiga();
  }

  /** Lupa o Enter: busca en SIGA (no reintenta si ya hay resultado para ese DNI). */
  protected onBuscarSiga(event?: Event): void {
    event?.preventDefault();

    if (this.buscandoSiga() || this.dniYaConsultadoSiga()) {
      return;
    }

    const dniControl = this.formulario.controls.dni;
    dniControl.markAsTouched();

    if (dniControl.invalid) {
      return;
    }

    this.solicitudSiga$.next({ dni: dniControl.value, forzar: false });
  }

  protected onLimpiarDatosPersonales(): void {
    this.solicitudSiga$.next(null);
    this.formulario.reset({
      dni: '',
      nivelId: '',
      nombreCompleto: '',
      fechaNacimiento: null,
      sexo: '',
    });
    this.limpiarDatosSiga();
    this.edad.set('');
  }

  /** Auto-busca al completar 8 dígitos; cancela si el DNI queda incompleto. */
  private intentarBusquedaSigaAutomatica(dni: string): void {
    if (dni.length < DNI_LENGTH) {
      if (this.buscandoSiga()) {
        this.solicitudSiga$.next(null);
      }
      return;
    }

    if (dni === this.dniConsultadoSiga()) {
      return;
    }

    this.solicitudSiga$.next({ dni, forzar: false });
  }

  private escucharBusquedaSiga(): void {
    this.solicitudSiga$
      .pipe(
        switchMap((solicitud) => {
          const generacion = ++this.generacionBusquedaSiga;

          if (!solicitud) {
            this.buscandoSiga.set(false);
            return EMPTY;
          }

          const { dni, forzar } = solicitud;
          if (!forzar && dni === this.dniConsultadoSiga()) {
            this.buscandoSiga.set(false);
            return EMPTY;
          }

          this.buscandoSiga.set(true);

          return this.obtenerDatosSiga.ejecutar(dni).pipe(
            map((resultado) => ({ dni, resultado })),
            finalize(() => {
              if (this.generacionBusquedaSiga === generacion) {
                this.buscandoSiga.set(false);
              }
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ dni, resultado }) => {
        // Ignora respuestas obsoletas si el DNI cambió mientras respondía el servidor.
        if (this.formulario.controls.dni.value !== dni) {
          return;
        }

        if (!resultado.exito) {
          this.limpiarDatosSiga();
          void this.alertas.error('No se encontró en SIGA', {
            mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        this.dniConsultadoSiga.set(dni);
        this.formulario.controls.nombreCompleto.setValue(resultado.datos.nombreCompleto);
        this.fotoSiga.set(resultado.datos.foto);
      });
  }

  /** Si el DNI deja de coincidir con la consulta SIGA, limpia foto y nombre. */
  private sincronizarDatosSigaConDni(dni: string): void {
    const consultado = this.dniConsultadoSiga();
    if (!consultado) {
      return;
    }

    if (!dni || dni !== consultado) {
      this.limpiarDatosSiga();
    }
  }

  private limpiarDatosSiga(): void {
    this.dniConsultadoSiga.set('');
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

  private cargarFechaValoracionVigente(): void {
    this.obtenerFechaVigente
      .ejecutar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (vigente) => {
          this.fechaValoracionVigente.set(vigente?.fechaValoracion ?? null);
        },
        error: () => {
          this.fechaValoracionVigente.set(null);
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
