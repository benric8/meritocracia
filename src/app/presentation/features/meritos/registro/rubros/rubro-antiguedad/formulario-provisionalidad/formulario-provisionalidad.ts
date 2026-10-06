import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, finalize } from 'rxjs';
import { CalcularTiempoServicioUseCase } from '../../../../../../../application/use-cases/meritos/calcular-tiempo-servicio.use-case';
import { CatalogoItem } from '../../../../../../../domain/models/catalogo-item.model';
import {
  TIEMPO_SERVICIO_CERO,
  TiempoServicio,
} from '../../../../../../../domain/models/tiempo-servicio.model';
import { Provisionalidad } from '../../../../../../../domain/models/rubro-antiguedad.model';
import {
  aDateDesdeIso,
  aFechaIsoLocal,
  corregirFechaFinSiAnteriorAInicio,
  crearFiltroFechaMaxima,
  crearFiltroFechaMinima,
  esFechaAnterior,
  esIdPersistidoApi,
  nuevoIdLocal,
} from '../../rubros.util';

export interface FormularioProvisionalidadData {
  /** Solo cargos del nivel de la ficha. */
  cargos: CatalogoItem[];
  provisionalidad?: Provisionalidad | null;
}

export type ProvisionalidadGuardada = Omit<Provisionalidad, 'id'> & { id?: string };

@Component({
  selector: 'app-formulario-provisionalidad',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
  ],
  templateUrl: './formulario-provisionalidad.html',
  styleUrl: './formulario-provisionalidad.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioProvisionalidad implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioProvisionalidad>);
  private readonly data = inject<FormularioProvisionalidadData>(MAT_DIALOG_DATA);
  private readonly calcularTiempo = inject(CalcularTiempoServicioUseCase);

  readonly guardar = output<ProvisionalidadGuardada>();

  protected readonly cargos = this.data.cargos;
  protected readonly esEdicion = !!this.data.provisionalidad;
  protected readonly esActualizacion = esIdPersistidoApi(this.data.provisionalidad?.id);
  protected readonly tiempoTotal = signal<TiempoServicio>(
    this.data.provisionalidad?.tiempoTotal ?? TIEMPO_SERVICIO_CERO
  );
  protected readonly calculando = signal(false);

  private readonly cargoFijoId = this.data.cargos[0]?.id ?? '';

  protected readonly formulario = this.fb.group({
    fechaInicio: this.fb.control<Date | null>(
      aDateDesdeIso(this.data.provisionalidad?.fechaInicio),
      Validators.required
    ),
    fechaFin: this.fb.control<Date | null>(
      aDateDesdeIso(this.data.provisionalidad?.fechaFin),
      Validators.required
    ),
    cargoId: this.fb.nonNullable.control(
      { value: this.cargoFijoId, disabled: true },
      Validators.required
    ),
    organoJurisdiccional: this.fb.nonNullable.control(
      this.data.provisionalidad?.organoJurisdiccional ?? '',
      Validators.maxLength(200)
    ),
    documento: this.fb.nonNullable.control(
      this.data.provisionalidad?.documento ?? '',
      Validators.maxLength(200)
    ),
  });

  protected readonly filtroFechaFin = crearFiltroFechaMinima(
    () => this.formulario.controls.fechaInicio.value
  );
  protected readonly filtroFechaInicio = crearFiltroFechaMaxima(
    () => this.formulario.controls.fechaFin.value
  );

  ngOnInit(): void {
    this.formulario.controls.fechaInicio.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((inicio) => {
        const fin = this.formulario.controls.fechaFin.value;
        const finCorregida = corregirFechaFinSiAnteriorAInicio(inicio, fin);
        if (finCorregida !== fin) {
          this.formulario.controls.fechaFin.setValue(finCorregida, { emitEvent: true });
        }
        this.actualizarErrorRango();
      });

    this.formulario.controls.fechaFin.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actualizarErrorRango());

    this.formulario.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalcularTiempo());
  }

  protected onCerrar(): void {
    this.dialogRef.close();
  }

  protected onGuardar(): void {
    this.actualizarErrorRango();
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const raw = this.formulario.getRawValue();
    const cargo = this.cargos.find((c) => c.id === raw.cargoId);
    if (!raw.fechaInicio || !raw.fechaFin || !cargo) {
      return;
    }
    if (esFechaAnterior(raw.fechaFin, raw.fechaInicio)) {
      return;
    }

    this.guardar.emit({
      id: this.data.provisionalidad?.id ?? nuevoIdLocal('prov'),
      fechaInicio: aFechaIsoLocal(raw.fechaInicio),
      fechaFin: aFechaIsoLocal(raw.fechaFin),
      tiempoTotal: this.tiempoTotal(),
      cargoId: cargo.id,
      cargoNombre: cargo.nombre,
      organoJurisdiccional: raw.organoJurisdiccional.trim(),
      documento: raw.documento.trim(),
    });
  }

  private actualizarErrorRango(): void {
    const inicio = this.formulario.controls.fechaInicio.value;
    const finCtrl = this.formulario.controls.fechaFin;
    const fin = finCtrl.value;

    if (inicio && fin && esFechaAnterior(fin, inicio)) {
      finCtrl.setErrors({ ...(finCtrl.errors ?? {}), fechaAnteriorAInicio: true });
      return;
    }

    if (finCtrl.hasError('fechaAnteriorAInicio')) {
      finCtrl.updateValueAndValidity({ emitEvent: false });
    }
  }

  private recalcularTiempo(): void {
    const { fechaInicio, fechaFin } = this.formulario.getRawValue();
    if (!fechaInicio || !fechaFin || esFechaAnterior(fechaFin, fechaInicio)) {
      this.tiempoTotal.set(TIEMPO_SERVICIO_CERO);
      return;
    }

    this.calculando.set(true);
    this.calcularTiempo
      .ejecutarEntreFechas(aFechaIsoLocal(fechaInicio), aFechaIsoLocal(fechaFin))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.calculando.set(false))
      )
      .subscribe((resultado) => {
        this.tiempoTotal.set(
          resultado.exito ? resultado.tiempo : TIEMPO_SERVICIO_CERO
        );
      });
  }
}
