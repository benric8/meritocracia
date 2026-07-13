import { Component, computed, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { DesactivarFechaValoracionUseCase } from '../../../../application/use-cases/meritos/desactivar-fecha-valoracion.use-case';
import { ObtenerFechaValoracionVigenteUseCase } from '../../../../application/use-cases/meritos/obtener-fecha-valoracion-vigente.use-case';
import { RegistrarFechaValoracionUseCase } from '../../../../application/use-cases/meritos/registrar-fecha-valoracion.use-case';
import {
  FechaValoracion,
  NuevaFechaValoracion,
} from '../../../../domain/models/fecha-valoracion.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { AuthStore } from '../../../../infrastructure/security/stores/auth.store';
import { formatearFechaCorta, formatearFechaHora } from './fecha-valoracion.util';
import {
  FormularioNuevaFechaValoracion,
  FormularioNuevaFechaValoracionData,
} from './formulario-nueva-fecha-valoracion/formulario-nueva-fecha-valoracion';
import { HistorialFechasValoracion } from './historial-fechas-valoracion/historial-fechas-valoracion';

@Component({
  selector: 'app-fecha',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, HistorialFechasValoracion],
  templateUrl: './fecha.html',
  styleUrl: './fecha.scss',
})
export class Fecha implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly authStore = inject(AuthStore);
  private readonly obtenerVigente = inject(ObtenerFechaValoracionVigenteUseCase);
  private readonly registrarFecha = inject(RegistrarFechaValoracionUseCase);
  private readonly desactivarFecha = inject(DesactivarFechaValoracionUseCase);
  private readonly historial = viewChild(HistorialFechasValoracion);

  protected readonly vigente = signal<FechaValoracion | null>(null);
  protected readonly cargando = signal(false);
  protected readonly desactivando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);

  protected readonly subtitulo = computed(() =>
    this.vigente()
      ? 'Vista administrador — configuración activa e historial de cambios'
      : 'Vista administrador — sin configuración vigente; registre la primera fecha de valoración'
  );

  protected readonly formatearFecha = formatearFechaCorta;
  protected readonly formatearFechaHora = formatearFechaHora;

  ngOnInit(): void {
    this.cargarVigente();
  }

  protected abrirFormulario(): void {
    this.mensajeExito.set(null);

    const data: FormularioNuevaFechaValoracionData = {
      hayConfiguracionVigente: !!this.vigente(),
    };

    const ref = this.dialog.open(FormularioNuevaFechaValoracion, {
      width: '560px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const guardarSub = ref.componentInstance.guardar.subscribe((peticion) => {
      this.onGuardar(peticion, ref);
    });

    ref.afterClosed().subscribe(() => guardarSub.unsubscribe());
  }

  protected async onDesactivar(): Promise<void> {
    const config = this.vigente();
    if (!config || this.desactivando()) {
      return;
    }

    this.mensajeExito.set(null);

    const fechaFormateada = this.formatearFecha(config.fechaValoracion);
    const confirmado = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Desactivar fecha de valoración',
      html: `¿Confirma que desea desactivar la fecha vigente <strong>${fechaFormateada}</strong>? Quedará sin configuración activa hasta registrar una nueva.`,
      textoConfirmar: 'Desactivar',
    });

    if (!confirmado) {
      return;
    }

    this.desactivando.set(true);

    this.desactivarFecha
      .ejecutar(config.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.desactivando.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo desactivar', {
            mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        this.mensajeExito.set('Fecha de valoración desactivada correctamente.');
        this.recargarTodo();
      });
  }

  private onGuardar(
    peticion: NuevaFechaValoracion,
    dialogRef: MatDialogRef<FormularioNuevaFechaValoracion>
  ): void {
    const usuario =
      this.authStore.nombreCompleto()?.trim() || this.authStore.usuario()?.trim() || '';

    dialogRef.componentInstance.guardando.set(true);

    this.registrarFecha
      .ejecutar(peticion, usuario)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => dialogRef.componentInstance.guardando.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo registrar', {
            mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        dialogRef.close();
        this.mensajeExito.set('Nueva fecha de valoración registrada correctamente.');
        this.recargarTodo();
      });
  }

  private recargarTodo(): void {
    this.cargarVigente();
    this.historial()?.recargar();
  }

  private cargarVigente(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.obtenerVigente
      .ejecutar()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (vigente) => this.vigente.set(vigente),
        error: () => {
          this.error.set('No se pudo cargar la configuración vigente.');
          this.vigente.set(null);
        },
      });
  }
}
