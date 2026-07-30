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
import { ListarCatalogosIdiomaUseCase } from '../../../../../../application/use-cases/meritos/listar-catalogos-idioma.use-case';
import { MutarItemsRubroIdiomaUseCase } from '../../../../../../application/use-cases/meritos/mutar-items-rubro-idioma.use-case';
import { CatalogoItem } from '../../../../../../domain/models/catalogo-item.model';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import {
  EstudioIdioma,
  IdiomaCatalogoItem,
  RubroIdioma,
} from '../../../../../../domain/models/rubro-idioma.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { esIdPersistidoApi, formatearPuntaje } from '../rubros.util';
import {
  EstudioIdiomaGuardado,
  FormularioIdioma,
  FormularioIdiomaData,
} from './formulario-idioma/formulario-idioma';

@Component({
  selector: 'app-rubro-idioma',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './rubro-idioma.html',
  styleUrl: './rubro-idioma.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroIdiomaComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarCatalogos = inject(ListarCatalogosIdiomaUseCase);
  private readonly mutarItems = inject(MutarItemsRubroIdiomaUseCase);

  readonly fichaId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroInicial = input<RubroIdioma | null>(null);
  readonly cargandoDetalle = input(false);

  readonly puntajeChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly cargandoCatalogos = signal(false);
  protected readonly errorCatalogos = signal<string | null>(null);
  protected readonly items = signal<EstudioIdioma[]>([]);
  protected readonly puntajeRubro = signal(0);

  protected readonly idiomas = signal<IdiomaCatalogoItem[]>([]);
  protected readonly nivelesIdioma = signal<CatalogoItem[]>([]);
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

  protected onEditar(item: EstudioIdioma): void {
    this.abrirModal(item);
  }

  protected async eliminarEstudioIdioma(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar estudio de idioma',
      html: '¿Confirma que desea eliminar este estudio de idioma?',
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
      .eliminarEstudioIdioma(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar el estudio de idioma', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroIdioma;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito(
          'Estudio eliminado',
          'El estudio de idioma se eliminó correctamente.'
        );
      });
  }

  private abrirModal(existente?: EstudioIdioma): void {
    if (this.soloLectura() || !this.catalogosCargados) {
      return;
    }

    const data: FormularioIdiomaData = {
      idiomas: this.idiomas(),
      nivelesIdioma: this.nivelesIdioma(),
      tiposDocumento: this.tiposDocumento(),
      paises: this.paises(),
      estudioIdioma: existente ?? null,
    };

    const ref = this.dialog.open(FormularioIdioma, {
      width: '760px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const sub = ref.componentInstance.guardar.subscribe((item) => {
      this.onGuardarEstudioIdioma(item, ref);
    });
    ref.afterClosed().subscribe(() => sub.unsubscribe());
  }

  private onGuardarEstudioIdioma(
    item: EstudioIdiomaGuardado,
    ref: MatDialogRef<FormularioIdioma>
  ): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      return;
    }

    const registro: EstudioIdioma = {
      id: item.id!,
      idiomaId: item.idiomaId,
      idiomaNombre: item.idiomaNombre,
      idiomaTipo: item.idiomaTipo,
      nivelIdiomaId: item.nivelIdiomaId,
      nivelIdiomaNombre: item.nivelIdiomaNombre,
      tipoDocumentoIdiomaId: item.tipoDocumentoIdiomaId,
      tipoDocumentoNombre: item.tipoDocumentoNombre,
      institucion: item.institucion,
      fechaObtencion: item.fechaObtencion,
      archivoId: item.archivoId,
      puntaje: item.puntaje,
    };

    const esActualizacion = esIdPersistidoApi(registro.id);

    this.mutarItems
      .upsertEstudioIdioma(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion
              ? 'No se pudo actualizar el estudio de idioma'
              : 'No se pudo guardar el estudio de idioma',
            {
              mensaje:
                resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroIdioma;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        ref.close();

        await this.alertas.exito(
          esActualizacion ? 'Estudio actualizado' : 'Estudio guardado',
          esActualizacion
            ? 'El estudio de idioma se actualizó correctamente.'
            : 'El estudio de idioma se guardó correctamente.'
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
              'No se pudieron cargar los catálogos del rubro F.'
          );
          return;
        }

        this.idiomas.set(resultado.catalogos.idiomas);
        this.nivelesIdioma.set(resultado.catalogos.nivelesIdioma);
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

  private hidratarRubro(rubro: RubroIdioma): void {
    this.items.set(rubro.items);
    this.puntajeRubro.set(rubro.puntajeTotal);
    this.puntajeChange.emit(rubro.puntajeTotal);
    this.enriquecerNombresCatalogo();
  }

  private enriquecerNombresCatalogo(): void {
    const idiomas = this.idiomas();
    const niveles = this.nivelesIdioma();
    const tipos = this.tiposDocumento();

    this.items.update((lista) =>
      lista.map((item) => {
        const idioma = idiomas.find((opcion) => opcion.id === item.idiomaId);
        return {
          ...item,
          idiomaNombre: idioma?.nombre ?? item.idiomaNombre,
          idiomaTipo: idioma?.tipo ?? item.idiomaTipo,
          nivelIdiomaNombre:
            niveles.find((opcion) => opcion.id === item.nivelIdiomaId)?.nombre ??
            item.nivelIdiomaNombre,
          tipoDocumentoNombre:
            tipos.find((opcion) => opcion.id === item.tipoDocumentoIdiomaId)?.nombre ??
            item.tipoDocumentoNombre,
        };
      })
    );
  }

  private claveRubro(rubro: RubroIdioma): string {
    return [
      rubro.puntajeTotal,
      rubro.items.length,
      ...rubro.items.map(
        (item) => `${item.id}|${item.idiomaId}|${item.nivelIdiomaId}|${item.puntaje}`
      ),
    ].join('::');
  }
}
