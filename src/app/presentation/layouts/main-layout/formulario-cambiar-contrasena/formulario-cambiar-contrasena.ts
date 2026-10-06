import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  CAMBIAR_CONTRASENA,
  CampoCambiarContrasena,
  ConfirmacionClaveErrorStateMatcher,
  mensajeErrorCampoCambiarContrasena,
  TEXTOS_CAMBIAR_CONTRASENA,
  VALIDADORES_CLAVE_CAMBIO,
  validadorClavesCoinciden,
} from '../validators/cambiar-contrasena.validators';

export type DatosCambiarContrasena = Record<CampoCambiarContrasena, string>;

type FormularioCambiarContrasenaControls = {
  [K in CampoCambiarContrasena]: FormControl<string>;
};

const VALORES_VACIOS: DatosCambiarContrasena = {
  claveActual: '',
  nuevaClave: '',
  confirmarClave: '',
};

const VISIBILIDAD_INICIAL: Record<CampoCambiarContrasena, boolean> = {
  claveActual: false,
  nuevaClave: false,
  confirmarClave: false,
};

@Component({
  selector: 'app-formulario-cambiar-contrasena',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './formulario-cambiar-contrasena.html',
  styleUrl: './formulario-cambiar-contrasena.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioCambiarContrasena {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormularioCambiarContrasena>);

  readonly guardando = signal(false);
  readonly guardar = output<DatosCambiarContrasena>();

  protected readonly campos = CAMBIAR_CONTRASENA.campos;
  protected readonly limitesClave = CAMBIAR_CONTRASENA.clave;
  protected readonly textos = TEXTOS_CAMBIAR_CONTRASENA;
  protected readonly mensajeErrorCampo = mensajeErrorCampoCambiarContrasena;
  protected readonly matcherConfirmacion = new ConfirmacionClaveErrorStateMatcher();

  protected readonly visibilidad = signal({ ...VISIBILIDAD_INICIAL });

  protected readonly formulario: FormGroup<FormularioCambiarContrasenaControls> =
    this.fb.nonNullable.group(
      {
        claveActual: this.fb.nonNullable.control('', VALIDADORES_CLAVE_CAMBIO),
        nuevaClave: this.fb.nonNullable.control('', VALIDADORES_CLAVE_CAMBIO),
        confirmarClave: this.fb.nonNullable.control('', VALIDADORES_CLAVE_CAMBIO),
      },
      { validators: validadorClavesCoinciden() }
    );

  constructor() {
    effect(() => {
      this.dialogRef.disableClose = this.guardando();
    });
  }

  protected onCerrar(): void {
    if (this.guardando()) {
      return;
    }
    this.dialogRef.close();
  }

  protected onLimpiar(): void {
    if (this.guardando()) {
      return;
    }
    this.limpiar();
  }

  protected onGuardar(): void {
    if (this.guardando()) {
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardar.emit(this.formulario.getRawValue());
  }

  protected alternarVisibilidad(campo: CampoCambiarContrasena): void {
    this.visibilidad.update((estado) => ({
      ...estado,
      [campo]: !estado[campo],
    }));
  }

  protected tipoCampo(campo: CampoCambiarContrasena): 'text' | 'password' {
    return this.visibilidad()[campo] ? 'text' : 'password';
  }

  protected ariaVisibilidad(campo: CampoCambiarContrasena): string {
    return this.visibilidad()[campo]
      ? this.textos.ariaOcultar[campo]
      : this.textos.ariaMostrar[campo];
  }

  protected iconoVisibilidad(campo: CampoCambiarContrasena): string {
    return this.visibilidad()[campo] ? 'visibility_off' : 'visibility';
  }

  private limpiar(): void {
    this.formulario.reset(VALORES_VACIOS);
    this.visibilidad.set({ ...VISIBILIDAD_INICIAL });
  }
}
