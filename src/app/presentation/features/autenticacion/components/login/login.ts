import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore, PerfilUsuario } from '../../../../../infrastructure/security/stores/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  /** Controla el botón de mostrar/ocultar contraseña. */
  protected readonly mostrarClave = signal(false);

  /** Formulario reactivo con los dos campos reglamentarios. */
  protected readonly form = this.fb.nonNullable.group({
    usuario: ['', [Validators.required]],
    clave: ['', [Validators.required]],
  });

  protected alternarClave(): void {
    this.mostrarClave.update((valor) => !valor);
  }

  /**
   * RF001/RF002 — Valida las credenciales y abre la sesión.
   * Por ahora la autenticación es simulada (sin backend): guardamos los datos
   * en el AuthStore y navegamos al layout privado. Cuando exista el servicio
   * de Spring Boot, esta lógica se reemplaza por la llamada HTTP real y el
   * perfil/token vendrán en la respuesta.
   */
  protected iniciar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const usuario = this.form.getRawValue().usuario.trim();

    // Simulación temporal del perfil según el usuario ingresado.
    const perfil: PerfilUsuario = usuario.toLowerCase().includes('admin')
      ? 'Administrador'
      : 'Usuario Registrador';

    this.authStore.establecerSesion(usuario, usuario, perfil, 'mock-token');
    this.router.navigate(['/inicio']);
  }

  protected limpiar(): void {
    this.form.reset();
    this.mostrarClave.set(false);
  }
}
