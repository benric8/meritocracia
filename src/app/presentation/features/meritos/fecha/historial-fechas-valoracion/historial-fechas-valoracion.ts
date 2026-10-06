import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ListarHistorialFechasValoracionUseCase } from '../../../../../application/use-cases/meritos/listar-historial-fechas-valoracion.use-case';
import { FechaValoracion } from '../../../../../domain/models/fecha-valoracion.model';
import { formatearFechaCorta } from '../fecha-valoracion.util';

@Component({
  selector: 'app-historial-fechas-valoracion',
  standalone: true,
  imports: [],
  templateUrl: './historial-fechas-valoracion.html',
  styleUrl: './historial-fechas-valoracion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialFechasValoracion implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly listarHistorial = inject(ListarHistorialFechasValoracionUseCase);

  protected readonly historial = signal<FechaValoracion[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  recargar(): void {
    this.cargar();
  }

  protected formatearFecha = formatearFechaCorta;

  protected etiquetaEstado(estado: FechaValoracion['estado']): string {
    return estado === 'VIGENTE' ? 'Vigente' : 'Inactivo';
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.listarHistorial
      .ejecutar()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (items) => this.historial.set(items),
        error: () => {
          this.error.set('No se pudo cargar el historial de configuraciones.');
          this.historial.set([]);
        },
      });
  }
}
