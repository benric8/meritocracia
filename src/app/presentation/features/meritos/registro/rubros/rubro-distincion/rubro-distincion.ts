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
import { ListarCatalogosDistincionUseCase } from '../../../../../../application/use-cases/meritos/listar-catalogos-distincion.use-case';
import { MutarItemsRubroDistincionUseCase } from '../../../../../../application/use-cases/meritos/mutar-items-rubro-distincion.use-case';
import { CatalogoItem } from '../../../../../../domain/models/catalogo-item.model';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import {
  Distincion,
  RubroDistincion,
  TipoDistincionCatalogoItem,
} from '../../../../../../domain/models/rubro-distincion.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { esIdPersistidoApi, formatearPuntaje } from '../rubros.util';
import {
  DistincionGuardada,
  FormularioDistincion,
  FormularioDistincionData,
} from './formulario-distincion/formulario-distincion';

@Component({
  selector: 'app-rubro-distincion',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './rubro-distincion.html',
  styleUrl: './rubro-distincion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroDistincionComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarCatalogos = inject(ListarCatalogosDistincionUseCase);
  private readonly mutarItems = inject(MutarItemsRubroDistincionUseCase);

  readonly fichaId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroInicial = input<RubroDistincion | null>(null);
  readonly cargandoDetalle = input(false);

  readonly puntajeChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly cargandoCatalogos = signal(false);
  protected readonly errorCatalogos = signal<string | null>(null);
  protected readonly items = signal<Distincion[]>([]);
  protected readonly puntajeRubro = signal(0);

  protected readonly tiposDistincion = signal<TipoDistincionCatalogoItem[]>([]);
  protected readonly tiposDocumento = signal<CatalogoItem[]>([]);
  protected readonly paises = signal<CatalogoItem[]>([]);

  protected readonly formatearPuntaje = formatearPuntaje;

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

  protected onAbrirFormulario(): void {
    this.abrirModal();
  }

  protected onEditar(item: Distincion): void {
    this.abrirModal(item);
  }

  protected async eliminarDistincion(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar distinción',
      html: '¿Confirma que desea eliminar esta distinción?',
      textoConfirmar: 'Eliminar',
    });
    if (!ok) {
      return;
    }

    const fichaId = this.fichaId();
    if (!fichaId || !esIdPersistidoApi(id)) {
      this.items.update((lista) => lista.filter((item) => item.id !== id));
      this.puntajeRubro.set(this.items().reduce((sum, item) => sum + (item.puntaje || 0), 0));
      this.puntajeChange.emit(this.puntajeRubro());
      return;
    }

    this.mutarItems
      .eliminarDistincion(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar la distinción', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroDistincion;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito(
          'Distinción eliminada',
          'La distinción se eliminó correctamente.'
        );
      });
  }

  private abrirModal(existente?: Distincion): void {
    if (this.soloLectura() || !this.catalogosCargados) {
      return;
    }

    const data: FormularioDistincionData = {
      tiposDistincion: this.tiposDistincion(),
      tiposDocumento: this.tiposDocumento(),
      paises: this.paises(),
      distincion: existente ?? null,
    };

    const ref = this.dialog.open(FormularioDistincion, {
      width: '820px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const sub = ref.componentInstance.guardar.subscribe((item) => {
      this.onGuardarDistincion(item, ref);
    });
    ref.afterClosed().subscribe(() => sub.unsubscribe());
  }

  private onGuardarDistincion(
    item: DistincionGuardada,
    ref: MatDialogRef<FormularioDistincion>
  ): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      return;
    }

    const registro: Distincion = {
      id: item.id!,
      tipoDistincionId: item.tipoDistincionId,
      tipoDistincionNombre: item.tipoDistincionNombre,
      tipoDistincionCodigo: item.tipoDistincionCodigo,
      tipoDocumentoDistincionId: item.tipoDocumentoDistincionId,
      tipoDocumentoDistincionNombre: item.tipoDocumentoDistincionNombre,
      descripcion: item.descripcion,
      fechaDistincion: item.fechaDistincion,
      institucionOtorgante: item.institucionOtorgante,
      paisId: item.paisId,
      paisNombre: item.paisNombre,
      archivoId: item.archivoId,
      puntaje: item.puntaje,
    };

    const esActualizacion = esIdPersistidoApi(registro.id);

    this.mutarItems
      .upsertDistincion(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion
              ? 'No se pudo actualizar la distinción'
              : 'No se pudo guardar la distinción',
            {
              mensaje:
                resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroDistincion;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        ref.close();

        await this.alertas.exito(
          esActualizacion ? 'Distinción actualizada' : 'Distinción guardada',
          esActualizacion
            ? 'La distinción se actualizó correctamente.'
            : 'La distinción se guardó correctamente.'
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
              'No se pudieron cargar los catálogos del rubro H.'
          );
          return;
        }

        this.tiposDistincion.set(resultado.catalogos.tiposDistincion);
        this.tiposDocumento.set(resultado.catalogos.tiposDocumento);
        this.paises.set(resultado.catalogos.paises);
        this.catalogosCargados = true;

        const rubro = this.rubroInicial();
        if (rubro) {
          const clave = this.claveRubro(rubro);
          if (this.ultimoRubroHidratadoClave !== clave) {
            this.hidratarRubro(rubro);
            this.ultimoRubroHidratadoClave = clave;
          }
        }
      });
  }

  private hidratarRubro(rubro: RubroDistincion): void {
    this.items.set(rubro.items);
    this.puntajeRubro.set(rubro.puntajeTotal);
    this.puntajeChange.emit(rubro.puntajeTotal);
    this.enriquecerNombresCatalogo();
  }

  private enriquecerNombresCatalogo(): void {
    const tipos = this.tiposDistincion();
    const documentos = this.tiposDocumento();
    const paises = this.paises();

    this.items.update((lista) =>
      lista.map((item) => {
        const tipo = tipos.find((opcion) => opcion.id === item.tipoDistincionId);
        return {
          ...item,
          tipoDistincionNombre: tipo?.nombre ?? item.tipoDistincionNombre,
          tipoDistincionCodigo: tipo?.codigo ?? item.tipoDistincionCodigo,
          tipoDocumentoDistincionNombre:
            documentos.find((opcion) => opcion.id === item.tipoDocumentoDistincionId)?.nombre ??
            item.tipoDocumentoDistincionNombre,
          paisNombre: paises.find((opcion) => opcion.id === item.paisId)?.nombre ?? item.paisNombre,
        };
      })
    );
  }

  private claveRubro(rubro: RubroDistincion): string {
    return [
      rubro.puntajeTotal,
      rubro.items.length,
      ...rubro.items.map(
        (item) =>
          `${item.id}|${item.tipoDistincionId}|${item.fechaDistincion}|${item.puntaje}`
      ),
    ].join('::');
  }
}
