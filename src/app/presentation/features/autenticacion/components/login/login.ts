import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { mapearPerfilUsuario, nombreCompletoPersona } from '../../../../../domain/commons/auth-mappers';
import { constantes } from '../../../../../domain/commons/constants';
import { Perfil, Usuario, LoginResponse } from '../../../../../domain/dto/remote/LoginResponse.dto';
import { AutenticacionService } from '../../../../../infrastructure/security/services/autenticacion.service';
import { AuthStore } from '../../../../../infrastructure/security/stores/auth.store';

type PasoLogin = 'credenciales' | 'perfil';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly mostrarClave = signal(false);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly paso = signal<PasoLogin>('credenciales');
  protected readonly perfilesDisponibles = signal<Perfil[]>([]);
  /** Indica si el handshake (token básico) ya está disponible. */
  protected readonly listoParaIngresar = signal(false);

  private usuarioLogin = '';
  private datosUsuario = signal<Usuario | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    usuario: ['', [Validators.required]],
    clave: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.precargarTokenBasico();
  }

  /**
   * Genera el token básico al entrar al login, para que al pulsar "Iniciar"
   * solo se ejecute la llamada que depende del usuario (login).
   */
  private precargarTokenBasico(): void {
    this.autenticacionService
      .asegurarTokenBasico()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.listoParaIngresar.set(true),
        // Si el handshake falla aquí, no bloqueamos: login() lo reintenta.
        error: () => this.listoParaIngresar.set(true),
      });
  }

  protected alternarClave(): void {
    this.mostrarClave.update((valor) => !valor);
  }

  protected iniciar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { usuario, clave } = this.form.getRawValue();
    this.usuarioLogin = usuario.trim();
    this.error.set(null);
    this.cargando.set(true);

    this.autenticacionService
      .login(this.usuarioLogin, clave)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (respuesta) => this.procesarLogin(respuesta),
        error: () => this.error.set('No se pudo conectar con el servidor. Intente nuevamente.'),
      });
  }

  protected seleccionarPerfil(perfil: Perfil): void {
    this.error.set(null);
    this.cargando.set(true);

    this.autenticacionService
      .opciones(this.usuarioLogin, perfil.idPerfil)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (respuesta) => {
          if (respuesta.codigo !== constantes.RES_COD_EXITO) {
            this.error.set(respuesta.descripcion || 'No se pudieron cargar las opciones del perfil.');
            return;
          }
          this.abrirSesion(perfil.rol || respuesta.data.rol);
        },
        error: () => this.error.set('No se pudieron cargar las opciones del perfil.'),
      });
  }

  protected volverACredenciales(): void {
    this.paso.set('credenciales');
    this.perfilesDisponibles.set([]);
    this.error.set(null);
  }

  protected limpiar(): void {
    this.form.reset();
    this.mostrarClave.set(false);
    this.error.set(null);
    this.paso.set('credenciales');
    this.perfilesDisponibles.set([]);
  }

  private procesarLogin(respuesta: LoginResponse): void {
    if (respuesta.codigo !== constantes.RES_COD_EXITO || !respuesta.data) {
      this.error.set(respuesta.descripcion || 'Credenciales inválidas.');
      return;
    }

    this.datosUsuario.set(respuesta.data);
    const perfiles = respuesta.data.perfiles ?? [];
    if (perfiles.length === 0) {
      this.error.set('El usuario no tiene perfiles asignados.');
      return;
    }

    if (perfiles.length === 1) {
      this.cargando.set(true);
      this.autenticacionService
        .opciones(this.usuarioLogin, perfiles[0].idPerfil)
        .pipe(finalize(() => this.cargando.set(false)))
        .subscribe({
          next: (respOpciones) => {
            if (respOpciones.codigo !== constantes.RES_COD_EXITO) {
              this.error.set(respOpciones.descripcion || 'No se pudieron cargar las opciones del perfil.');
              return;
            }
            this.abrirSesion(perfiles[0].rol || respOpciones.data.rol);
          },
          error: () => this.error.set('No se pudieron cargar las opciones del perfil.'),
        });
      return;
    }

    this.perfilesDisponibles.set(perfiles);
    this.paso.set('perfil');
  }

  private abrirSesion(rol: string): void {
    const perfil = mapearPerfilUsuario(rol);
    const persona = this.datosUsuario()?.persona;
    const nombre = persona ? nombreCompletoPersona(persona) : this.usuarioLogin;
    const token = localStorage.getItem(constantes.JWT_TOKEN) ?? '';

    this.authStore.establecerSesion(this.usuarioLogin, nombre, perfil, token);
    this.router.navigate(['/inicio']);
  }
}
