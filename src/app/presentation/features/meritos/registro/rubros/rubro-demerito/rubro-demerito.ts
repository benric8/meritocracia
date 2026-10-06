import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { take } from 'rxjs';
import { MutarItemsRubroDemeritoUseCase } from '../../../../../../application/use-cases/meritos/mutar-items-rubro-demerito.use-case';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import {
  Demerito,
  OPCIONES_TIPO_MEDIDA,
  RubroDemerito,
  TIPOS_DOCUMENTO_DEMERITO,
} from '../../../../../../domain/models/rubro-demerito.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { esIdPersistidoApi, formatearPuntaje } from '../rubros.util';
import {
  DemeritoGuardado,
  FormularioDemerito,
  FormularioDemeritoData,
} from './formulario-demerito/formulario-demerito';

@Component({
  selector: 'app-rubro-demerito',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './rubro-demerito.html',
  styleUrl: './rubro-demerito.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroDemeritoComponent {
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly mutarItems = inject(MutarItemsRubroDemeritoUseCase);

  readonly fichaId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroInicial = input<RubroDemerito | null>(null);
  readonly cargandoDetalle = input(false);

  readonly puntajeChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly items = signal<Demerito[]>([]);
  protected readonly puntajeRubro = signal(0);
  protected readonly formatearPuntaje = formatearPuntaje;

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

  protected etiquetaMedida(codigo: string): string {
    return OPCIONES_TIPO_MEDIDA.find((item) => item.valor === codigo)?.etiqueta ?? codigo;
  }

  protected etiquetaDocumento(codigo: string): string {
    return TIPOS_DOCUMENTO_DEMERITO.find((item) => item.valor === codigo)?.etiqueta ?? codigo;
  }

  protected onAbrirFormulario(): void {
    this.abrirModal();
  }

  protected onEditar(item: Demerito): void {
    this.abrirModal(item);
  }

  protected async eliminarDemerito(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar demérito',
      html: '¿Confirma que desea eliminar este demérito?',
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
      .eliminarDemerito(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar el demérito', {
            mensaje:
              resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroDemerito;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito('Demérito eliminado', 'El demérito se eliminó correctamente.');
      });
  }

  private abrirModal(existente?: Demerito): void {
    if (this.soloLectura()) {
      return;
    }

    const data: FormularioDemeritoData = {
      demerito: existente ?? null,
    };

    const ref = this.dialog.open(FormularioDemerito, {
      width: '760px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const sub = ref.componentInstance.guardar.subscribe((item) => {
      this.onGuardarDemerito(item, ref);
    });
    ref.afterClosed().subscribe(() => sub.unsubscribe());
  }

  private onGuardarDemerito(
    item: DemeritoGuardado,
    ref: MatDialogRef<FormularioDemerito>
  ): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      return;
    }

    const registro: Demerito = {
      id: item.id!,
      tipoMedida: item.tipoMedida,
      cantidad: item.cantidad,
      descripcionDocumento: item.descripcionDocumento,
      anioValoracion: 0,
      observacion: item.observacion,
      archivoId: item.archivoId,
      puntaje: item.puntaje,
    };

    const esActualizacion = esIdPersistidoApi(registro.id);

    this.mutarItems
      .upsertDemerito(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion ? 'No se pudo actualizar el demérito' : 'No se pudo guardar el demérito',
            {
              mensaje:
                resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroDemerito;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        ref.close();

        await this.alertas.exito(
          esActualizacion ? 'Demérito actualizado' : 'Demérito guardado',
          esActualizacion
            ? 'El demérito se actualizó correctamente.'
            : 'El demérito se guardó correctamente.'
        );
      });
  }

  private hidratarRubro(rubro: RubroDemerito): void {
    this.items.set(rubro.items);
    this.puntajeRubro.set(rubro.puntajeTotal);
    this.puntajeChange.emit(rubro.puntajeTotal);
  }

  private claveRubro(rubro: RubroDemerito): string {
    return [
      rubro.puntajeTotal,
      rubro.items.length,
      ...rubro.items.map(
        (item) =>
          `${item.id}|${item.tipoMedida}|${item.cantidad}|${item.anioValoracion}|${item.puntaje}`
      ),
    ].join('::');
  }
}
