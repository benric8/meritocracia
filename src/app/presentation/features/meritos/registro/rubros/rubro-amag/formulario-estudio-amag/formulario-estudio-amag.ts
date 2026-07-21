import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CatalogoItem } from '../../../../../../../domain/models/catalogo-item.model';
import { EstudioAmag } from '../../../../../../../domain/models/rubro-amag.model';
import { esIdPersistidoApi, nuevoIdLocal } from '../../rubros.util';

export interface FormularioEstudioAmagData {
  tiposCurso: CatalogoItem[];
  estudioAmag?: EstudioAmag | null;
}

export type EstudioAmagGuardado = Omit<EstudioAmag, 'id'> & { id?: string };

@Component({
  selector: 'app-formulario-estudio-amag',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './formulario-estudio-amag.html',
  styleUrl: './formulario-estudio-amag.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioEstudioAmag implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioEstudioAmag>);
  private readonly data = inject<FormularioEstudioAmagData>(MAT_DIALOG_DATA);

  readonly guardar = output<EstudioAmagGuardado>();

  protected readonly tiposCurso = this.data.tiposCurso;
  protected readonly esActualizacion = esIdPersistidoApi(this.data.estudioAmag?.id);
  protected readonly anioActual = new Date().getFullYear();

  protected readonly formulario = this.fb.group({
    tipoCursoId: this.fb.nonNullable.control(
      this.data.estudioAmag?.tipoCursoId ?? '',
      Validators.required
    ),
    nota: this.fb.control<number | null>(this.data.estudioAmag?.nota ?? null, [
      Validators.required,
      Validators.min(0),
      Validators.max(20),
    ]),
    descripcion: this.fb.nonNullable.control(
      this.data.estudioAmag?.descripcion ?? '',
      Validators.required
    ),
    anio: this.fb.control<number | null>(this.data.estudioAmag?.anio ?? null, [
      Validators.required,
      Validators.min(1950),
      Validators.max(2100),
    ]),
  });

  ngOnInit(): void {
    // Sin lógica adicional por ahora.
  }

  protected onCerrar(): void {
    this.dialogRef.close();
  }

  protected onGuardar(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      return;
    }

    const raw = this.formulario.getRawValue();
    const tipo = this.tiposCurso.find((item) => item.id === raw.tipoCursoId);
    if (!tipo || raw.nota == null || raw.anio == null) {
      return;
    }

    this.guardar.emit({
      id: this.data.estudioAmag?.id ?? nuevoIdLocal('amag'),
      tipoCursoId: tipo.id,
      tipoCursoNombre: tipo.nombre,
      nota: Number(raw.nota),
      descripcion: raw.descripcion.trim(),
      anio: Number(raw.anio),
      puntaje: this.data.estudioAmag?.puntaje ?? 0,
    });
  }
}
