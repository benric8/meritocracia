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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { CalcularEdadJuezUseCase } from '../../../../application/use-cases/meritos/calcular-edad-juez.use-case';
import { ListarNivelesTitularUseCase } from '../../../../application/use-cases/meritos/listar-niveles-titular.use-case';
import { ObtenerDatosSigaJuezUseCase } from '../../../../application/use-cases/meritos/obtener-datos-siga-juez.use-case';
import { ObtenerFechaValoracionVigenteUseCase } from '../../../../application/use-cases/meritos/obtener-fecha-valoracion-vigente.use-case';
import { NivelTitular } from '../../../../domain/models/nivel-titular.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import {
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

  protected readonly opcionesSexo = OPCIONES_SEXO;
  protected readonly mensajeErrorCampo = mensajeErrorCampoDatosPersonales;
  protected readonly formatearFecha = formatearFechaCorta;

  protected readonly formulario = this.fb.nonNullable.group({
    dni: ['', VALIDADORES_DNI],
    nivelId: ['', VALIDADORES_NIVEL],
    nombreCompleto: ['', VALIDADORES_NOMBRE_COMPLETO],
    fechaNacimiento: ['', VALIDADORES_FECHA_NACIMIENTO],
    sexo: ['', VALIDADORES_SEXO],
  });

  ngOnInit(): void {
    this.cargarNiveles();
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
  }

  protected onBuscarSiga(): void {
    if (this.buscandoSiga()) {
      return;
    }

    const dniControl = this.formulario.controls.dni;
    dniControl.markAsTouched();

    if (dniControl.invalid) {
      return;
    }

    this.buscandoSiga.set(true);

    this.obtenerDatosSiga
      .ejecutar(dniControl.value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.buscandoSiga.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se encontró en SIGA', {
            mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        this.formulario.controls.nombreCompleto.setValue(resultado.datos.nombreCompleto);
        this.fotoSiga.set(resultado.datos.foto);
      });
  }

  protected onLimpiarDatosPersonales(): void {
    this.formulario.reset({
      dni: '',
      nivelId: '',
      nombreCompleto: '',
      fechaNacimiento: '',
      sexo: '',
    });
    this.fotoSiga.set('');
    this.edad.set('');
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
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((fechaNacimiento) => {
        this.solicitarEdad(fechaNacimiento);
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
