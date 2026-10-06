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
import { ListarCatalogosOfimaticaUseCase } from '../../../../../../application/use-cases/meritos/listar-catalogos-ofimatica.use-case';
import { MutarItemsRubroOfimaticaUseCase } from '../../../../../../application/use-cases/meritos/mutar-items-rubro-ofimatica.use-case';
import { CatalogoItem } from '../../../../../../domain/models/catalogo-item.model';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import {
  EstudioOfimatica,
  etiquetaEstadoOfimatica,
  NivelOfimaticaCatalogo,
  RubroOfimatica,
} from '../../../../../../domain/models/rubro-ofimatica.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { esIdPersistidoApi, formatearFechaCorta } from '../rubros.util';
import {
  EstudioOfimaticaGuardado,
  FormularioOfimatica,
  FormularioOfimaticaData,
} from './formulario-ofimatica/formulario-ofimatica';

@Component({
  selector: 'app-rubro-ofimatica',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './rubro-ofimatica.html',
  styleUrl: './rubro-ofimatica.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroOfimaticaComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarCatalogos = inject(ListarCatalogosOfimaticaUseCase);
  private readonly mutarItems = inject(MutarItemsRubroOfimaticaUseCase);

  readonly fichaId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroInicial = input<RubroOfimatica | null>(null);
  readonly cargandoDetalle = input(false);

  readonly puntajeChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly cargandoCatalogos = signal(false);
  protected readonly errorCatalogos = signal<string | null>(null);
  protected readonly items = signal<EstudioOfimatica[]>([]);
  protected readonly puntajeRubro = signal(0);
  protected readonly niveles = signal<NivelOfimaticaCatalogo[]>([]);
  protected readonly tiposDocumento = signal<CatalogoItem[]>([]);
  protected readonly paises = signal<CatalogoItem[]>([]);
  protected readonly etiquetaEstado = etiquetaEstadoOfimatica;
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

  protected etiquetaNivel(item: EstudioOfimatica): string {
    const texto = item.nivelOfimaticaDescripcion?.trim();
    if (texto) {
      return texto;
    }
    return (
      this.niveles().find((nivel) => nivel.id === item.nivelOfimaticaId)?.descripcion ||
      (item.nivelOfimaticaId ? `Id ${item.nivelOfimaticaId}` : '—')
    );
  }

  protected etiquetaInstitucion(item: EstudioOfimatica): string {
    return item.institucionNombre?.trim() || (item.institucionId ? `Id ${item.institucionId}` : '—');
  }

  protected etiquetaPais(item: EstudioOfimatica): string {
    return this.textoCatalogoItem(item.nombrePais, item.paisId, this.paises());
  }

  protected etiquetaTipoDocumento(item: EstudioOfimatica): string {
    return this.textoCatalogoItem(
      item.tipoDocumentoDescripcion,
      item.tipoDocumentoId,
      this.tiposDocumento()
    );
  }

  protected onAbrirFormulario(): void {
    this.abrirModal();
  }

  protected onEditar(item: EstudioOfimatica): void {
    this.abrirModal(item);
  }

  protected async eliminarEstudio(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar estudio de ofimática',
      html: '¿Confirma que desea eliminar este estudio?',
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
      .eliminarEstudio(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar el estudio', {
            mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroOfimatica;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito('Estudio eliminado', 'El estudio de ofimática se eliminó correctamente.');
      });
  }

  private abrirModal(existente?: EstudioOfimatica): void {
    if (this.soloLectura()) {
      return;
    }

    const data: FormularioOfimaticaData = {
      niveles: this.niveles(),
      tiposDocumento: this.tiposDocumento(),
      paises: this.paises(),
      estudio: existente ?? null,
    };

    const ref = this.dialog.open(FormularioOfimatica, {
      width: '860px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const sub = ref.componentInstance.guardar.subscribe((item) => {
      this.onGuardarEstudio(item, ref);
    });
    ref.afterClosed().subscribe(() => sub.unsubscribe());
  }

  private onGuardarEstudio(
    item: EstudioOfimaticaGuardado,
    ref: MatDialogRef<FormularioOfimatica>
  ): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      return;
    }

    const registro: EstudioOfimatica = {
      id: item.id!,
      nombreCurso: item.nombreCurso,
      institucionId: item.institucionId,
      institucionNombre: item.institucionNombre,
      paisId: item.paisId,
      nombrePais: item.nombrePais,
      duracionHoras: item.duracionHoras,
      nivelOfimaticaId: item.nivelOfimaticaId,
      nivelOfimaticaCodigo: item.nivelOfimaticaCodigo,
      nivelOfimaticaDescripcion: item.nivelOfimaticaDescripcion,
      tipoDocumentoId: item.tipoDocumentoId,
      tipoDocumentoDescripcion: item.tipoDocumentoDescripcion,
      fechaObtencion: item.fechaObtencion,
      archivoId: item.archivoId,
      puntaje: item.puntaje,
    };

    const esActualizacion = esIdPersistidoApi(registro.id);

    this.mutarItems
      .upsertEstudio(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion ? 'No se pudo actualizar el estudio' : 'No se pudo guardar el estudio',
            {
              mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroOfimatica;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        ref.close();

        await this.alertas.exito(
          esActualizacion ? 'Estudio actualizado' : 'Estudio guardado',
          esActualizacion
            ? 'El estudio de ofimática se actualizó correctamente.'
            : 'El estudio de ofimática se guardó correctamente.'
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
              'No se pudieron cargar los catálogos de ofimática.'
          );
          return;
        }

        this.niveles.set(resultado.catalogos.niveles);
        this.tiposDocumento.set(resultado.catalogos.tiposDocumento);
        this.paises.set(resultado.catalogos.paises);
      });
  }

  private hidratarRubro(rubro: RubroOfimatica): void {
    this.items.set(rubro.items);
    this.puntajeRubro.set(rubro.puntajeTotal);
    this.puntajeChange.emit(rubro.puntajeTotal);
  }

  private claveRubro(rubro: RubroOfimatica): string {
    return [
      rubro.puntajeTotal,
      rubro.items.length,
      ...rubro.items.map(
        (item) =>
          `${item.id}|${item.fechaObtencion}|${item.puntaje}|${item.nombreCurso}|${item.institucionNombre}|${item.nivelOfimaticaId}|${item.duracionHoras}|${item.tipoDocumentoDescripcion}`
      ),
    ].join('::');
  }

  private textoCatalogoItem(descripcion: string, id: string, catalogo: CatalogoItem[]): string {
    const texto = descripcion?.trim();
    if (texto) {
      return texto;
    }
    return catalogo.find((item) => item.id === id)?.nombre || (id ? `Id ${id}` : '—');
  }
}
