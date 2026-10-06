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
import { ListarCatalogosPublicacionJuridicaUseCase } from '../../../../../../application/use-cases/meritos/listar-catalogos-publicacion-juridica.use-case';
import { MutarItemsRubroPublicacionJuridicaUseCase } from '../../../../../../application/use-cases/meritos/mutar-items-rubro-publicacion-juridica.use-case';
import { CatalogoItem } from '../../../../../../domain/models/catalogo-item.model';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import {
  PublicacionJuridica,
  RubroPublicacionJuridica,
} from '../../../../../../domain/models/rubro-publicacion-juridica.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { esIdPersistidoApi, formatearPuntaje } from '../rubros.util';
import {
  FormularioPublicacionJuridica,
  FormularioPublicacionJuridicaData,
  PublicacionJuridicaGuardada,
} from './formulario-publicacion-juridica/formulario-publicacion-juridica';

@Component({
  selector: 'app-rubro-publicacion-juridica',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './rubro-publicacion-juridica.html',
  styleUrl: './rubro-publicacion-juridica.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroPublicacionJuridicaComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarCatalogos = inject(ListarCatalogosPublicacionJuridicaUseCase);
  private readonly mutarItems = inject(MutarItemsRubroPublicacionJuridicaUseCase);

  readonly fichaId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroInicial = input<RubroPublicacionJuridica | null>(null);
  readonly cargandoDetalle = input(false);

  readonly puntajeChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly cargandoCatalogos = signal(false);
  protected readonly errorCatalogos = signal<string | null>(null);
  protected readonly items = signal<PublicacionJuridica[]>([]);
  protected readonly puntajeRubro = signal(0);

  protected readonly tiposPublicacion = signal<CatalogoItem[]>([]);
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

  protected etiquetaPremiada(premiada: boolean): string {
    return premiada ? 'Sí' : 'No';
  }

  protected onAbrirFormulario(): void {
    this.abrirModal();
  }

  protected onEditar(item: PublicacionJuridica): void {
    this.abrirModal(item);
  }

  protected async eliminarPublicacion(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar publicación',
      html: '¿Confirma que desea eliminar esta publicación jurídica?',
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
      .eliminarPublicacionJuridica(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar la publicación', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroPublicacionJuridica;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito(
          'Publicación eliminada',
          'La publicación jurídica se eliminó correctamente.'
        );
      });
  }

  private abrirModal(existente?: PublicacionJuridica): void {
    if (this.soloLectura() || !this.catalogosCargados) {
      return;
    }

    const data: FormularioPublicacionJuridicaData = {
      tiposPublicacion: this.tiposPublicacion(),
      paises: this.paises(),
      publicacion: existente ?? null,
    };

    const ref = this.dialog.open(FormularioPublicacionJuridica, {
      width: '820px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const sub = ref.componentInstance.guardar.subscribe((item) => {
      this.onGuardarPublicacion(item, ref);
    });
    ref.afterClosed().subscribe(() => sub.unsubscribe());
  }

  private onGuardarPublicacion(
    item: PublicacionJuridicaGuardada,
    ref: MatDialogRef<FormularioPublicacionJuridica>
  ): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      return;
    }

    const registro: PublicacionJuridica = {
      id: item.id!,
      tipoPublicacionId: item.tipoPublicacionId,
      tipoPublicacionNombre: item.tipoPublicacionNombre,
      titulo: item.titulo,
      editorial: item.editorial,
      paginas: item.paginas,
      numEdicion: item.numEdicion,
      auspicio: item.auspicio,
      paisId: item.paisId,
      paisNombre: item.paisNombre,
      ordenJuridico: item.ordenJuridico,
      especialidad: item.especialidad,
      institucionId: item.institucionId,
      institucionNombre: item.institucionNombre,
      fechaPublicacion: item.fechaPublicacion,
      premiada: item.premiada,
      archivoId: item.archivoId,
      puntaje: item.puntaje,
    };

    const esActualizacion = esIdPersistidoApi(registro.id);

    this.mutarItems
      .upsertPublicacionJuridica(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion
              ? 'No se pudo actualizar la publicación'
              : 'No se pudo guardar la publicación',
            {
              mensaje:
                resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroPublicacionJuridica;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        ref.close();

        await this.alertas.exito(
          esActualizacion ? 'Publicación actualizada' : 'Publicación guardada',
          esActualizacion
            ? 'La publicación jurídica se actualizó correctamente.'
            : 'La publicación jurídica se guardó correctamente.'
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
              'No se pudieron cargar los catálogos del rubro G.'
          );
          return;
        }

        this.tiposPublicacion.set(resultado.catalogos.tiposPublicacion);
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

  private hidratarRubro(rubro: RubroPublicacionJuridica): void {
    this.items.set(rubro.items);
    this.puntajeRubro.set(rubro.puntajeTotal);
    this.puntajeChange.emit(rubro.puntajeTotal);
    this.enriquecerNombresCatalogo();
  }

  private enriquecerNombresCatalogo(): void {
    const tipos = this.tiposPublicacion();
    const paises = this.paises();

    this.items.update((lista) =>
      lista.map((item) => ({
        ...item,
        tipoPublicacionNombre:
          tipos.find((opcion) => opcion.id === item.tipoPublicacionId)?.nombre ??
          item.tipoPublicacionNombre,
        paisNombre: paises.find((opcion) => opcion.id === item.paisId)?.nombre ?? item.paisNombre,
      }))
    );
  }

  private claveRubro(rubro: RubroPublicacionJuridica): string {
    return [
      rubro.puntajeTotal,
      rubro.items.length,
      ...rubro.items.map(
        (item) =>
          `${item.id}|${item.tipoPublicacionId}|${item.premiada}|${item.fechaPublicacion}|${item.puntaje}`
      ),
    ].join('::');
  }
}
