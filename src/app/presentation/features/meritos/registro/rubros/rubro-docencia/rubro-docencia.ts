import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, take } from 'rxjs';
import { ListarCatalogosDocenciaUseCase } from '../../../../../../application/use-cases/meritos/listar-catalogos-docencia.use-case';
import { MutarItemsRubroDocenciaUseCase } from '../../../../../../application/use-cases/meritos/mutar-items-rubro-docencia.use-case';
import { CatalogoItem } from '../../../../../../domain/models/catalogo-item.model';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import {
  DocenciaUniversitaria,
  RubroDocencia,
  TIPOS_DOCUMENTO_DOCENCIA,
} from '../../../../../../domain/models/rubro-docencia.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { esIdPersistidoApi, formatearFechaCorta, formatearPuntaje } from '../rubros.util';
import {
  DocenciaGuardada,
  FormularioDocencia,
  FormularioDocenciaData,
} from './formulario-docencia/formulario-docencia';

@Component({
  selector: 'app-rubro-docencia',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './rubro-docencia.html',
  styleUrl: './rubro-docencia.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroDocenciaComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarCatalogos = inject(ListarCatalogosDocenciaUseCase);
  private readonly mutarItems = inject(MutarItemsRubroDocenciaUseCase);

  readonly fichaId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroInicial = input<RubroDocencia | null>(null);
  readonly cargandoDetalle = input(false);

  readonly puntajeChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly cargandoCatalogos = signal(false);
  protected readonly errorCatalogos = signal<string | null>(null);
  protected readonly items = signal<DocenciaUniversitaria[]>([]);
  protected readonly puntajeRubro = signal(0);
  protected readonly especialidades = signal<CatalogoItem[]>([]);
  protected readonly formatearPuntaje = formatearPuntaje;
  protected readonly formatearFechaCorta = formatearFechaCorta;

  private catalogosCargados = false;
  private ultimoRubroHidratadoClave: string | null = null;

  constructor() {
    effect(() => {
      const rubro = this.rubroInicial();
      if (!rubro) {
        return;
      }

      const clave = this.claveRubro(rubro);
      if (this.ultimoRubroHidratadoClave === clave) {
        return;
      }

      this.hidratarRubro(rubro);
      this.ultimoRubroHidratadoClave = clave;
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  protected etiquetaDocumento(codigo: string): string {
    return TIPOS_DOCUMENTO_DOCENCIA.find((item) => item.valor === codigo)?.etiqueta ?? codigo;
  }

  protected onAbrirFormulario(): void {
    this.abrirModal();
  }

  protected onEditar(item: DocenciaUniversitaria): void {
    this.abrirModal(item);
  }

  protected async eliminarDocencia(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar docencia',
      html: '¿Confirma que desea eliminar esta docencia?',
      textoConfirmar: 'Eliminar',
    });
    if (!ok) {
      return;
    }

    const fichaId = this.fichaId();
    if (!fichaId || !esIdPersistidoApi(id)) {
      this.items.update((lista) => lista.filter((item) => item.id !== id));
      return;
    }

    this.mutarItems
      .eliminarDocencia(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar la docencia', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroDocencia;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito('Docencia eliminada', 'La docencia se eliminó correctamente.');
      });
  }

  private abrirModal(existente?: DocenciaUniversitaria): void {
    if (this.soloLectura() || !this.catalogosCargados) {
      return;
    }

    const data: FormularioDocenciaData = {
      especialidades: this.especialidades(),
      docencia: existente ?? null,
    };

    const ref = this.dialog.open(FormularioDocencia, {
      width: '820px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const sub = ref.componentInstance.guardar.subscribe((item) => {
      this.onGuardarDocencia(item, ref);
    });
    ref.afterClosed().subscribe(() => sub.unsubscribe());
  }

  private onGuardarDocencia(
    item: DocenciaGuardada,
    ref: MatDialogRef<FormularioDocencia>
  ): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      return;
    }

    const registro: DocenciaUniversitaria = {
      id: item.id!,
      descripcionDocumento: item.descripcionDocumento,
      universidad: item.universidad,
      horasSemanales: item.horasSemanales,
      fechaInicio: item.fechaInicio,
      fechaFin: item.fechaFin,
      ordenJuridico: item.ordenJuridico,
      especialidad: item.especialidad,
      materia: item.materia,
      categoria: item.categoria,
      condicion: item.condicion,
      archivoId: item.archivoId,
      puntaje: item.puntaje,
    };

    const esActualizacion = esIdPersistidoApi(registro.id);

    this.mutarItems
      .upsertDocencia(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion
              ? 'No se pudo actualizar la docencia'
              : 'No se pudo guardar la docencia',
            {
              mensaje:
                resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroDocencia;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        ref.close();

        await this.alertas.exito(
          esActualizacion ? 'Docencia actualizada' : 'Docencia guardada',
          esActualizacion
            ? 'La docencia se actualizó correctamente.'
            : 'La docencia se guardó correctamente.'
        );
      });
  }

  private cargarCatalogos(): void {
    this.cargandoCatalogos.set(true);
    this.errorCatalogos.set(null);

    this.listarCatalogos
      .ejecutar()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoCatalogos.set(false))
      )
      .subscribe((resultado) => {
        if (!resultado.exito) {
          this.errorCatalogos.set(
            resultado.detalle?.mensaje ??
              resultado.mensaje ??
              'No se pudieron cargar los catálogos del rubro I.'
          );
          return;
        }

        this.especialidades.set(resultado.catalogos.especialidades);
        this.catalogosCargados = true;
      });
  }

  private hidratarRubro(rubro: RubroDocencia): void {
    this.items.set(rubro.items);
    this.puntajeRubro.set(rubro.puntajeTotal);
    this.puntajeChange.emit(rubro.puntajeTotal);
  }

  private claveRubro(rubro: RubroDocencia): string {
    return [
      rubro.puntajeTotal,
      rubro.items.length,
      ...rubro.items.map(
        (item) =>
          `${item.id}|${item.universidad}|${item.fechaInicio}|${item.fechaFin}|${item.horasSemanales}|${item.puntaje}`
      ),
    ].join('::');
  }
}
