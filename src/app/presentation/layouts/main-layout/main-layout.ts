import { Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { CambiarContrasenaUseCase } from '../../../application/use-cases/usuarios/cambiar-contrasena.use-case';
import { ALERTAS_PORT } from '../../../domain/ports/alertas.port';
import { AuthStore } from '../../../infrastructure/security/stores/auth.store';
import { SessionVigenciaService } from '../../../infrastructure/security/session/session-vigencia.service';
import {
  FormularioCambiarContrasena,
  DatosCambiarContrasena,
} from './formulario-cambiar-contrasena/formulario-cambiar-contrasena';
import { construirArbolMenu, MENU_MINIMO, MenuItem } from './menu.model';
import { TEXTOS_CAMBIAR_CONTRASENA } from './validators/cambiar-contrasena.validators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatExpansionModule,
    MatDividerModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  public authStore = inject(AuthStore);
  private readonly sessionVigencia = inject(SessionVigenciaService);
  private readonly cambiarContrasena = inject(CambiarContrasenaUseCase);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private router = inject(Router);

  private readonly textosClave = TEXTOS_CAMBIAR_CONTRASENA.feedback;

  /**
   * Menú lateral desde las opciones del backend (RF003).
   * Sin opciones válidas solo se muestra Inicio hasta que el usuario reingrese.
   */
  public readonly menuItems = computed<MenuItem[]>(() => {
    const opciones = this.authStore.opciones();
    if (!opciones?.length) {
      return MENU_MINIMO;
    }
    return construirArbolMenu(opciones);
  });

  onCambiarPassword(): void {
    const ref = this.dialog.open(FormularioCambiarContrasena, {
      width: '440px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
    });

    const guardarSub = ref.componentInstance.guardar.subscribe((datos) => {
      this.onGuardarContrasena(datos, ref);
    });

    ref.afterClosed().subscribe(() => guardarSub.unsubscribe());
  }

  private onGuardarContrasena(
    datos: DatosCambiarContrasena,
    dialogRef: MatDialogRef<FormularioCambiarContrasena>
  ): void {
    dialogRef.componentInstance.guardando.set(true);

    this.cambiarContrasena
      .ejecutar({
        claveActual: datos.claveActual,
        nuevaClave: datos.nuevaClave,
        confirmarClave: datos.confirmarClave,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => dialogRef.componentInstance.guardando.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(this.textosClave.errorTitulo, resultado.detalle);
          return;
        }

        dialogRef.close();
        void this.confirmarCambioYCerrarSesion();
      });
  }

  private async confirmarCambioYCerrarSesion(): Promise<void> {
    await this.alertas.exito(this.textosClave.exitoTitulo, this.textosClave.exitoTexto);
    this.onCerrarSesion();
  }

  onCerrarSesion(): void {
    this.sessionVigencia.cerrarSesionManual();
    void this.router.navigate(['/login']);
  }
}
