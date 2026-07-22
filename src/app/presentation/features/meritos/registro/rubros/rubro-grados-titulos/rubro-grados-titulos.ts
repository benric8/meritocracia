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
import { ListarCatalogosGradosTitulosUseCase } from '../../../../../../application/use-cases/meritos/listar-catalogos-grados-titulos.use-case';
import { MutarItemsRubroGradosTitulosUseCase } from '../../../../../../application/use-cases/meritos/mutar-items-rubro-grados-titulos.use-case';
import { CatalogoItem } from '../../../../../../domain/models/catalogo-item.model';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import {
  GradoTitulo,
  etiquetaEspecialidadGrado,
  RubroGradosTitulos,
} from '../../../../../../domain/models/rubro-grados-titulos.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import {
  esIdPersistidoApi,
  formatearFechaCorta,
  formatearPuntaje,
} from '../rubros.util';
import {
  FormularioGradoTitulo,
  FormularioGradoTituloData,
  GradoTituloGuardado,
} from './formulario-grado-titulo/formulario-grado-titulo';

@Component({
  selector: 'app-rubro-grados-titulos',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './rubro-grados-titulos.html',
  styleUrl: './rubro-grados-titulos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroGradosTitulosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarCatalogos = inject(ListarCatalogosGradosTitulosUseCase);
  private readonly mutarItems = inject(MutarItemsRubroGradosTitulosUseCase);

  readonly fichaId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroInicial = input<RubroGradosTitulos | null>(null);
  readonly cargandoDetalle = input(false);

  readonly puntajeChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly cargandoCatalogos = signal(false);
  protected readonly errorCatalogos = signal<string | null>(null);
  protected readonly items = signal<GradoTitulo[]>([]);
  protected readonly puntajeRubro = signal(0);

  protected readonly nivelesGrado = signal<CatalogoItem[]>([]);
  protected readonly paises = signal<CatalogoItem[]>([]);

  protected readonly formatearFecha = formatearFechaCorta;
  protected readonly formatearPuntaje = formatearPuntaje;
  protected readonly formatearEspecialidad = etiquetaEspecialidadGrado;

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

  protected onEditar(item: GradoTitulo): void {
    this.abrirModal(item);
  }

  protected async eliminarGradoTitulo(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar grado académico',
      html: '¿Confirma que desea eliminar este grado académico o título profesional?',
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
      .eliminarGradoTitulo(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar el grado', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroGradosTitulos;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito(
          'Grado eliminado',
          'El grado académico se eliminó correctamente.'
        );
      });
  }

  private abrirModal(existente?: GradoTitulo): void {
    if (this.soloLectura() || !this.catalogosCargados) {
      return;
    }

    const data: FormularioGradoTituloData = {
      nivelesGrado: this.nivelesGrado(),
      paises: this.paises(),
      gradoTitulo: existente ?? null,
    };

    const ref = this.dialog.open(FormularioGradoTitulo, {
      width: '760px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const sub = ref.componentInstance.guardar.subscribe((item) => {
      this.onGuardarGradoTitulo(item, ref);
    });
    ref.afterClosed().subscribe(() => sub.unsubscribe());
  }

  private onGuardarGradoTitulo(
    item: GradoTituloGuardado,
    ref: MatDialogRef<FormularioGradoTitulo>
  ): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      return;
    }

    const registro: GradoTitulo = {
      id: item.id!,
      gradoAcademicoId: item.gradoAcademicoId,
      gradoAcademicoNombre: item.gradoAcademicoNombre,
      universidadId: item.universidadId,
      universidadNombre: item.universidadNombre,
      paisId: item.paisId,
      paisNombre: item.paisNombre,
      fechaObtencion: item.fechaObtencion,
      especialidad: item.especialidad,
      mencion: item.mencion,
      observacion: item.observacion,
      puntaje: item.puntaje,
    };

    const esActualizacion = esIdPersistidoApi(registro.id);

    this.mutarItems
      .upsertGradoTitulo(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion ? 'No se pudo actualizar el grado' : 'No se pudo guardar el grado',
            {
              mensaje:
                resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroGradosTitulos;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        ref.close();

        await this.alertas.exito(
          esActualizacion ? 'Grado actualizado' : 'Grado guardado',
          esActualizacion
            ? 'El grado académico se actualizó correctamente.'
            : 'El grado académico se guardó correctamente.'
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
              'No se pudieron cargar los catálogos del rubro C.'
          );
          return;
        }

        this.nivelesGrado.set(resultado.catalogos.nivelesGrado);
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

  private hidratarRubro(rubro: RubroGradosTitulos): void {
    this.items.set(rubro.items);
    this.puntajeRubro.set(rubro.puntajeTotal);
    this.puntajeChange.emit(rubro.puntajeTotal);
    this.enriquecerNombresCatalogo();
  }

  private enriquecerNombresCatalogo(): void {
    const niveles = this.nivelesGrado();
    const paises = this.paises();

    this.items.update((lista) =>
      lista.map((item) => ({
        ...item,
        gradoAcademicoNombre:
          niveles.find((nivel) => nivel.id === item.gradoAcademicoId)?.nombre ??
          item.gradoAcademicoNombre,
        paisNombre: paises.find((pais) => pais.id === item.paisId)?.nombre ?? item.paisNombre,
      }))
    );
  }

  private claveRubro(rubro: RubroGradosTitulos): string {
    return [
      rubro.puntajeTotal,
      rubro.items.length,
      ...rubro.items.map((item) => `${item.id}|${item.fechaObtencion}|${item.puntaje}`),
    ].join('::');
  }
}
