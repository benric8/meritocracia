import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize, Subject, switchMap, tap } from 'rxjs';
import { DescargarCuadroAntiguedadUseCase } from '../../../../application/use-cases/reportes/descargar-cuadro-antiguedad.use-case';
import { ListarFechasValoracionReporteUseCase } from '../../../../application/use-cases/reportes/listar-fechas-valoracion-reporte.use-case';
import { ObtenerCuadroAntiguedadUseCase } from '../../../../application/use-cases/reportes/obtener-cuadro-antiguedad.use-case';
import {
  ArchivoDescargado,
  CuadroAntiguedad,
  FormatoDescargaCuadro,
} from '../../../../domain/models/cuadro-antiguedad.model';
import { DetalleError } from '../../../../domain/models/detalle-error.model';
import { FechaValoracion } from '../../../../domain/models/fecha-valoracion.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { aFilaCuadroVista, formatearFechaCuadro } from './cuadro-antiguedad.util';

/** N015: no existe la fecha de valoración enviada o no hay una activa. */
const CODIGO_FECHA_NO_ENCONTRADA = 'N015';

/**
 * RF007 - Submenú B: Cuadro de Antigüedad de Jueces Supremos Titulares (Anexo 01).
 * El backend calcula los tiempos, ordena por precedencia y asigna el N° de orden:
 * la pantalla solo muestra lo que recibe (sin ordenar por columna).
 */
@Component({
  selector: 'app-cuadro-antiguedad-supremos',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './cuadro-antiguedad-supremos.html',
  styleUrl: './cuadro-antiguedad-supremos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuadroAntiguedadSupremos implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarFechas = inject(ListarFechasValoracionReporteUseCase);
  private readonly obtenerCuadro = inject(ObtenerCuadroAntiguedadUseCase);
  private readonly descargarCuadro = inject(DescargarCuadroAntiguedadUseCase);

  /** Cada consulta cancela la anterior: el cuadro siempre es de la última fecha elegida. */
  private readonly consultas = new Subject<string>();

  protected readonly fechas = signal<FechaValoracion[]>([]);
  protected readonly idVigente = signal<string | null>(null);
  protected readonly idFechaSeleccionada = signal('');
  protected readonly cuadro = signal<CuadroAntiguedad | null>(null);
  protected readonly error = signal<DetalleError | null>(null);
  protected readonly cargando = signal(true);
  protected readonly descargando = signal<FormatoDescargaCuadro | null>(null);

  protected readonly filas = computed(() => (this.cuadro()?.filas ?? []).map(aFilaCuadroVista));
  protected readonly fechaValoracion = computed(() =>
    formatearFechaCuadro(this.cuadro()?.fechaValoracion)
  );
  protected readonly errorDeFecha = computed(
    () => this.error()?.codigo === CODIGO_FECHA_NO_ENCONTRADA
  );
  protected readonly descargasDeshabilitadas = computed(
    () => this.cargando() || !!this.descargando() || this.filas().length === 0
  );

  constructor() {
    this.consultas
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.error.set(null);
        }),
        switchMap((idFecha) => this.obtenerCuadro.ejecutar(idFecha || undefined)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((resultado) => {
        this.cargando.set(false);
        if (resultado.exito) {
          this.cuadro.set(resultado.cuadro);
          return;
        }
        this.cuadro.set(null);
        this.error.set(resultado.detalle);
      });
  }

  ngOnInit(): void {
    this.listarFechas
      .ejecutar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resultado) => {
        if (resultado.exito) {
          this.fechas.set(resultado.fechas);
          this.idVigente.set(resultado.idVigente);
          this.idFechaSeleccionada.set(resultado.idVigente ?? '');
        } else {
          void this.alertas.error('No se pudieron cargar las fechas de valoración', resultado.detalle);
        }
        // Sin fecha elegida el backend usa la fecha de valoración activa.
        this.consultas.next(this.idFechaSeleccionada());
      });
  }

  protected onFechaCambiada(idFecha: string): void {
    this.idFechaSeleccionada.set(idFecha ?? '');
    this.consultas.next(this.idFechaSeleccionada());
  }

  protected onReintentar(): void {
    this.consultas.next(this.idFechaSeleccionada());
  }

  protected onDescargar(formato: FormatoDescargaCuadro): void {
    if (this.descargasDeshabilitadas()) {
      return;
    }
    // Misma fecha que la del cuadro en pantalla, para que el archivo coincida.
    const idFecha = this.cuadro()?.idFechaValoracion || this.idFechaSeleccionada();
    this.descargando.set(formato);

    this.descargarCuadro
      .ejecutar(formato, idFecha || undefined)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.descargando.set(null))
      )
      .subscribe((resultado) => {
        if (resultado.exito) {
          this.guardarArchivo(resultado.archivo);
          return;
        }
        void this.alertas.error('No se pudo descargar el archivo', resultado.detalle);
      });
  }

  protected etiquetaFecha(fecha: FechaValoracion): string {
    return formatearFechaCuadro(fecha.fechaValoracion);
  }

  private guardarArchivo({ nombre, contenido }: ArchivoDescargado): void {
    const url = URL.createObjectURL(contenido);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
