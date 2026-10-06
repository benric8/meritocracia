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
import { ListarCatalogosAmagUseCase } from '../../../../../../application/use-cases/meritos/listar-catalogos-amag.use-case';
import { MutarItemsRubroAmagUseCase } from '../../../../../../application/use-cases/meritos/mutar-items-rubro-amag.use-case';
import { CatalogoItem } from '../../../../../../domain/models/catalogo-item.model';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import { EstudioAmag, RubroAmag } from '../../../../../../domain/models/rubro-amag.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { esIdPersistidoApi, formatearPuntaje } from '../rubros.util';
import {
  EstudioAmagGuardado,
  FormularioEstudioAmag,
  FormularioEstudioAmagData,
} from './formulario-estudio-amag/formulario-estudio-amag';

@Component({
  selector: 'app-rubro-amag',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './rubro-amag.html',
  styleUrl: './rubro-amag.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroAmagComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarCatalogos = inject(ListarCatalogosAmagUseCase);
  private readonly mutarItems = inject(MutarItemsRubroAmagUseCase);

  readonly fichaId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroInicial = input<RubroAmag | null>(null);
  readonly cargandoDetalle = input(false);

  readonly puntajeChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly cargandoCatalogos = signal(false);
  protected readonly errorCatalogos = signal<string | null>(null);
  protected readonly items = signal<EstudioAmag[]>([]);
  protected readonly puntajeRubro = signal(0);

  protected readonly tiposCurso = signal<CatalogoItem[]>([]);

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

  protected onEditar(item: EstudioAmag): void {
    this.abrirModal(item);
  }

  protected async eliminarEstudioAmag(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar estudio AMAG',
      html: '¿Confirma que desea eliminar este estudio de preparación AMAG?',
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
      .eliminarEstudioAmag(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar el estudio AMAG', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroAmag;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito(
          'Estudio eliminado',
          'El estudio AMAG se eliminó correctamente.'
        );
      });
  }

  private abrirModal(existente?: EstudioAmag): void {
    if (this.soloLectura() || !this.catalogosCargados) {
      return;
    }

    const data: FormularioEstudioAmagData = {
      tiposCurso: this.tiposCurso(),
      estudioAmag: existente ?? null,
    };

    const ref = this.dialog.open(FormularioEstudioAmag, {
      width: '720px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const sub = ref.componentInstance.guardar.subscribe((item) => {
      this.onGuardarEstudioAmag(item, ref);
    });
    ref.afterClosed().subscribe(() => sub.unsubscribe());
  }

  private onGuardarEstudioAmag(
    item: EstudioAmagGuardado,
    ref: MatDialogRef<FormularioEstudioAmag>
  ): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      return;
    }

    const registro: EstudioAmag = {
      id: item.id!,
      tipoCursoId: item.tipoCursoId,
      tipoCursoNombre: item.tipoCursoNombre,
      nota: item.nota,
      descripcion: item.descripcion,
      anio: item.anio,
      puntaje: item.puntaje,
    };

    const esActualizacion = esIdPersistidoApi(registro.id);

    this.mutarItems
      .upsertEstudioAmag(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion
              ? 'No se pudo actualizar el estudio AMAG'
              : 'No se pudo guardar el estudio AMAG',
            {
              mensaje:
                resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroAmag;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        ref.close();

        await this.alertas.exito(
          esActualizacion ? 'Estudio actualizado' : 'Estudio guardado',
          esActualizacion
            ? 'El estudio AMAG se actualizó correctamente.'
            : 'El estudio AMAG se guardó correctamente.'
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
              'No se pudieron cargar los catálogos del rubro D.'
          );
          return;
        }

        this.tiposCurso.set(resultado.catalogos.tiposCurso);
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

  private hidratarRubro(rubro: RubroAmag): void {
    this.items.set(rubro.items);
    this.puntajeRubro.set(rubro.puntajeTotal);
    this.puntajeChange.emit(rubro.puntajeTotal);
    this.enriquecerNombresCatalogo();
  }

  private enriquecerNombresCatalogo(): void {
    const tipos = this.tiposCurso();

    this.items.update((lista) =>
      lista.map((item) => ({
        ...item,
        tipoCursoNombre:
          tipos.find((tipo) => tipo.id === item.tipoCursoId)?.nombre ?? item.tipoCursoNombre,
      }))
    );
  }

  private claveRubro(rubro: RubroAmag): string {
    return [
      rubro.puntajeTotal,
      rubro.items.length,
      ...rubro.items.map((item) => `${item.id}|${item.anio}|${item.puntaje}`),
    ].join('::');
  }
}
