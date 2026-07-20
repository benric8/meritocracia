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
import { CalcularAniosColegiaturaUseCase } from '../../../../../../../application/use-cases/meritos/calcular-anios-colegiatura.use-case';
import { CatalogoItem } from '../../../../../../../domain/models/catalogo-item.model';
import { Colegiatura } from '../../../../../../../domain/models/rubro-antiguedad.model';
import {
  aDateDesdeIso,
  aFechaIsoLocal,
  crearFiltroFechaMaxima,
  nuevoIdLocal,
} from '../../rubros.util';

export interface FormularioColegiaturaData {
  colegios: CatalogoItem[];
  fechaValoracion: string | null;
  colegiatura?: Colegiatura | null;
}

export type ColegiaturaGuardada = Omit<Colegiatura, 'id'> & { id?: string };

@Component({
  selector: 'app-formulario-colegiatura',
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
  templateUrl: './formulario-colegiatura.html',
  styleUrl: './formulario-colegiatura.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioColegiatura implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioColegiatura>);
  private readonly data = inject<FormularioColegiaturaData>(MAT_DIALOG_DATA);
  private readonly calcularAnios = inject(CalcularAniosColegiaturaUseCase);

  readonly guardar = output<ColegiaturaGuardada>();

  protected readonly colegios = this.data.colegios;
  protected readonly esEdicion = !!this.data.colegiatura;
  protected readonly anios = signal(this.data.colegiatura?.anios ?? 0);
  protected readonly calculando = signal(false);
  protected readonly sinFechaValoracion = !this.data.fechaValoracion;

  /** Solo fechas del año actual hacia atrás (sin fechas futuras). */
  protected readonly fechaMaximaColegiatura = (() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  })();

  protected readonly filtroFechaColegiatura = crearFiltroFechaMaxima(
    () => this.fechaMaximaColegiatura
  );

  protected readonly formulario = this.fb.group({
    colegioId: this.fb.nonNullable.control(
      this.data.colegiatura?.colegioId ?? '',
      Validators.required
    ),
    fechaColegiatura: this.fb.control<Date | null>(
      aDateDesdeIso(this.data.colegiatura?.fechaColegiatura),
      Validators.required
    ),
  });

  ngOnInit(): void {
    this.formulario.controls.fechaColegiatura.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalcularAnios());

    if (this.data.colegiatura?.fechaColegiatura && this.data.fechaValoracion) {
      this.recalcularAnios();
    }
  }

  protected onCerrar(): void {
    this.dialogRef.close();
  }

  protected onGuardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const raw = this.formulario.getRawValue();
    const colegio = this.colegios.find((c) => c.id === raw.colegioId);
    if (!raw.fechaColegiatura || !colegio) {
      return;
    }

    if (raw.fechaColegiatura.getTime() > this.fechaMaximaColegiatura.getTime()) {
      this.formulario.controls.fechaColegiatura.setErrors({ fechaFutura: true });
      this.formulario.controls.fechaColegiatura.markAsTouched();
      return;
    }

    this.guardar.emit({
      id: this.data.colegiatura?.id ?? nuevoIdLocal('col'),
      colegioId: colegio.id,
      colegioNombre: colegio.nombre,
      fechaColegiatura: aFechaIsoLocal(raw.fechaColegiatura),
      anios: this.anios(),
    });
  }

  private recalcularAnios(): void {
    const fecha = this.formulario.controls.fechaColegiatura.value;
    const valoracion = this.data.fechaValoracion;
    if (!fecha || !valoracion) {
      this.anios.set(0);
      return;
    }

    this.calculando.set(true);
    this.calcularAnios
      .ejecutar(aFechaIsoLocal(fecha), valoracion)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.calculando.set(false))
      )
      .subscribe((resultado) => {
        this.anios.set(resultado.exito ? resultado.anios : 0);
      });
  }
}
