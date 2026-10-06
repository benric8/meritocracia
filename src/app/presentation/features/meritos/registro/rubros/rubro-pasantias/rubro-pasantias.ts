import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { take } from 'rxjs';
import { ListarCatalogosPasantiasUseCase } from '../../../../../../application/use-cases/meritos/listar-catalogos-pasantias.use-case';
import { MutarItemsRubroPasantiasUseCase } from '../../../../../../application/use-cases/meritos/mutar-items-rubro-pasantias.use-case';
import { CatalogoItem } from '../../../../../../domain/models/catalogo-item.model';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import {
  etiquetaJuridicoPasantia,
  Pasantia,
  RubroPasantias,
  TipoPasantiaCatalogo,
} from '../../../../../../domain/models/rubro-pasantias.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { esIdPersistidoApi, formatearFechaCorta } from '../rubros.util';
import {
  FormularioPasantia,
  FormularioPasantiaData,
  PasantiaGuardada,
} from './formulario-pasantia/formulario-pasantia';

@Component({
  selector: 'app-rubro-pasantias',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './rubro-pasantias.html',
  styleUrl: './rubro-pasantias.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroPasantiasComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarCatalogos = inject(ListarCatalogosPasantiasUseCase);
  private readonly mutarItems = inject(MutarItemsRubroPasantiasUseCase);

  readonly fichaId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroInicial = input<RubroPasantias | null>(null);
  readonly cargandoDetalle = input(false);

  readonly puntajeChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly cargandoCatalogos = signal(false);
  protected readonly errorCatalogos = signal<string | null>(null);
  protected readonly items = signal<Pasantia[]>([]);
  protected readonly puntajeRubro = signal(0);
  protected readonly tipos = signal<TipoPasantiaCatalogo[]>([]);
  protected readonly paises = signal<CatalogoItem[]>([]);
  protected readonly especialidades = signal<CatalogoItem[]>([]);
  protected readonly etiquetaJuridico = etiquetaJuridicoPasantia;
  protected readonly formatearFecha = formatearFechaCorta;

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

  protected formatearPuntajeFila(puntaje: number): string {
    const valor = Number(puntaje);
    return Number.isFinite(valor) ? valor.toFixed(3) : '0.000';
  }

  protected etiquetaInstitucion(item: Pasantia): string {
    return item.institucionNombre?.trim() || `Id ${item.institucionId}`;
  }

  protected onAbrirFormulario(): void {
    this.abrirModal();
  }

  protected onEditar(item: Pasantia): void {
    this.abrirModal(item);
  }

  protected async eliminarPasantia(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar pasantía',
      html: '¿Confirma que desea eliminar esta pasantía?',
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
      .eliminarPasantia(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar la pasantía', {
            mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroPasantias;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito('Pasantía eliminada', 'La pasantía se eliminó correctamente.');
      });
  }

  private abrirModal(existente?: Pasantia): void {
    if (this.soloLectura()) {
      return;
    }

    const data: FormularioPasantiaData = {
      tipos: this.tipos(),
      paises: this.paises(),
      especialidades: this.especialidades(),
      pasantia: existente ?? null,
    };

    const ref = this.dialog.open(FormularioPasantia, {
      width: '860px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const sub = ref.componentInstance.guardar.subscribe((item) => {
      this.onGuardarPasantia(item, ref);
    });
    ref.afterClosed().subscribe(() => sub.unsubscribe());
  }

  private onGuardarPasantia(
    item: PasantiaGuardada,
    ref: MatDialogRef<FormularioPasantia>
  ): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      return;
    }

    const registro: Pasantia = {
      id: item.id!,
      tipoPasantiaId: item.tipoPasantiaId,
      tipoPasantiaDescripcion: item.tipoPasantiaDescripcion,
      institucionId: item.institucionId,
      institucionNombre: item.institucionNombre,
      paisId: item.paisId,
      paisNombre: item.paisNombre,
      fechaInicio: item.fechaInicio,
      fechaFin: item.fechaFin,
      juridico: item.juridico,
      especialidadId: item.especialidadId,
      especialidadDescripcion: item.especialidadDescripcion,
      mencion: item.mencion,
      archivoId: item.archivoId,
      puntaje: item.puntaje,
    };

    const esActualizacion = esIdPersistidoApi(registro.id);

    this.mutarItems
      .upsertPasantia(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion ? 'No se pudo actualizar la pasantía' : 'No se pudo guardar la pasantía',
            {
              mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroPasantias;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        ref.close();

        await this.alertas.exito(
          esActualizacion ? 'Pasantía actualizada' : 'Pasantía guardada',
          esActualizacion
            ? 'La pasantía se actualizó correctamente.'
            : 'La pasantía se guardó correctamente.'
        );
      });
  }

  private cargarCatalogos(): void {
    this.cargandoCatalogos.set(true);
    this.errorCatalogos.set(null);

    this.listarCatalogos
      .ejecutar()
      .pipe(take(1))
      .subscribe((resultado) => {
        this.cargandoCatalogos.set(false);
        if (!resultado.exito) {
          this.errorCatalogos.set(
            resultado.detalle?.mensaje ??
              resultado.mensaje ??
              'No se pudieron cargar los catálogos de pasantías.'
          );
          return;
        }

        this.tipos.set(resultado.catalogos.tipos);
        this.paises.set(resultado.catalogos.paises);
        this.especialidades.set(resultado.catalogos.especialidades);
      });
  }

  private hidratarRubro(rubro: RubroPasantias): void {
    this.items.set(rubro.items);
    this.puntajeRubro.set(rubro.puntajeTotal);
    this.puntajeChange.emit(rubro.puntajeTotal);
  }

  private claveRubro(rubro: RubroPasantias): string {
    return [
      rubro.puntajeTotal,
      rubro.items.length,
      ...rubro.items.map(
        (item) =>
          `${item.id}|${item.fechaFin}|${item.puntaje}|${item.institucionNombre}|${item.tipoPasantiaDescripcion}|${item.especialidadDescripcion}|${item.mencion}|${item.juridico}`
      ),
    ].join('::');
  }
}
