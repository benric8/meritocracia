import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { CompletarSesionPerfilUseCase } from '../../../../../application/use-cases/completar-sesion-perfil.use-case';
import { IniciarSesionUseCase } from '../../../../../application/use-cases/iniciar-sesion.use-case';
import { PrecargarTokenBasicoUseCase } from '../../../../../application/use-cases/precargar-token-basico.use-case';
import { SessionVigenciaService } from '../../../../../infrastructure/security/session/session-vigencia.service';
import { ResultadoInicioSesion } from '../../../../../domain/models/resultado-inicio-sesion.model';
import { PersonaModel } from '../../../../../domain/models/Persona.model';
import { Perfil } from '../../../../../domain/dto/remote/LoginResponse.dto';

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
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly precargarTokenBasico = inject(PrecargarTokenBasicoUseCase);
  private readonly iniciarSesion = inject(IniciarSesionUseCase);
  private readonly completarSesionPerfil = inject(CompletarSesionPerfilUseCase);
  private readonly sessionVigencia = inject(SessionVigenciaService);

  protected readonly mostrarClave = signal(false);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly paso = signal<PasoLogin>('credenciales');
  protected readonly perfilesDisponibles = signal<Perfil[]>([]);
  protected readonly listoParaIngresar = signal(false);

  private usuarioLogin = '';
  private personaLogin?: PersonaModel;

  protected readonly form = this.fb.nonNullable.group({
    usuario: ['', [Validators.required]],
    clave: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.precargarTokenBasico
      .ejecutar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.listoParaIngresar.set(true),
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

    this.iniciarSesion
      .ejecutar(this.usuarioLogin, clave)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (resultado) => this.procesarResultadoInicio(resultado),
        error: () => this.error.set('No se pudo conectar con el servidor. Intente nuevamente.'),
      });
  }

  protected seleccionarPerfil(perfil: Perfil): void {
    this.error.set(null);
    this.cargando.set(true);

    this.completarSesionPerfil
      .ejecutar({
        usuario: this.usuarioLogin,
        idPerfil: perfil.idPerfil,
        rol: perfil.rol,
        nombrePerfil: perfil.nombre,
        persona: this.personaLogin,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (resultado) => {
          if (!resultado.exito) {
            this.error.set(resultado.mensaje ?? 'No se pudieron cargar las opciones del perfil.');
            return;
          }
          this.entrarAInicio();
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

  private procesarResultadoInicio(resultado: ResultadoInicioSesion): void {
    switch (resultado.tipo) {
      case 'error':
      case 'sin_perfiles':
        this.error.set(resultado.mensaje);
        break;
      case 'sesion_completa':
        this.entrarAInicio();
        break;
      case 'seleccion_perfil':
        this.personaLogin = resultado.datosUsuario.persona;
        this.perfilesDisponibles.set(resultado.perfiles);
        this.paso.set('perfil');
        break;
    }
  }

  private entrarAInicio(): void {
    this.sessionVigencia.iniciarMonitoreo();
    void this.router.navigate(['/inicio']);
  }
}
