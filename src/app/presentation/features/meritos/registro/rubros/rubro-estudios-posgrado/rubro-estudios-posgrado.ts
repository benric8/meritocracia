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
import { ListarCatalogosEstudiosPosgradoUseCase } from '../../../../../../application/use-cases/meritos/listar-catalogos-estudios-posgrado.use-case';
import { MutarItemsRubroEstudiosPosgradoUseCase } from '../../../../../../application/use-cases/meritos/mutar-items-rubro-estudios-posgrado.use-case';
import { CatalogoItem } from '../../../../../../domain/models/catalogo-item.model';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import {
  EstudioPosgrado,
  OPCIONES_CONDICION_ACADEMICA_POSGRADO,
  OPCIONES_ESPECIALIDAD_POSGRADO,
  RubroEstudiosPosgrado,
} from '../../../../../../domain/models/rubro-estudios-posgrado.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { esIdPersistidoApi } from '../rubros.util';
import {
  EstudioPosgradoGuardado,
  FormularioEstudioPosgrado,
  FormularioEstudioPosgradoData,
} from './formulario-estudio-posgrado/formulario-estudio-posgrado';

@Component({
  selector: 'app-rubro-estudios-posgrado',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './rubro-estudios-posgrado.html',
  styleUrl: './rubro-estudios-posgrado.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroEstudiosPosgradoComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarCatalogos = inject(ListarCatalogosEstudiosPosgradoUseCase);
  private readonly mutarItems = inject(MutarItemsRubroEstudiosPosgradoUseCase);

  readonly fichaId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroInicial = input<RubroEstudiosPosgrado | null>(null);
  readonly cargandoDetalle = input(false);

  readonly puntajeChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly cargandoCatalogos = signal(false);
  protected readonly errorCatalogos = signal<string | null>(null);
  protected readonly items = signal<EstudioPosgrado[]>([]);
  protected readonly puntajeRubro = signal(0);
  protected readonly paises = signal<CatalogoItem[]>([]);

  protected formatearPuntajeSemestre(puntaje: number): string {
    const valor = Number(puntaje);
    return Number.isFinite(valor) ? valor.toFixed(3) : '0.000';
  }

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

  protected etiquetaCondicion(codigo: string): string {
    return (
      OPCIONES_CONDICION_ACADEMICA_POSGRADO.find((item) => item.valor === codigo)?.etiqueta ??
      codigo
    );
  }

  protected etiquetaEspecialidad(codigo: string): string {
    return OPCIONES_ESPECIALIDAD_POSGRADO.find((item) => item.valor === codigo)?.etiqueta ?? codigo;
  }

  protected etiquetaUniversidad(item: EstudioPosgrado): string {
    return item.institucionNombre?.trim() || `Id ${item.institucionId}`;
  }

  protected formatearPromedio(promedio: number | null): string {
    if (promedio == null || !Number.isFinite(promedio)) {
      return '—';
    }
    return promedio.toFixed(2);
  }

  protected onAbrirFormulario(): void {
    this.abrirModal();
  }

  protected onEditar(item: EstudioPosgrado): void {
    this.abrirModal(item);
  }

  protected async eliminarEstudio(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar semestre',
      html: '¿Confirma que desea eliminar este semestre de posgrado?',
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
      .eliminarEstudioPosgrado(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar el semestre', {
            mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroEstudiosPosgrado;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito(
          'Semestre eliminado',
          'El semestre de posgrado se eliminó correctamente.'
        );
      });
  }

  private abrirModal(existente?: EstudioPosgrado): void {
    if (this.soloLectura()) {
      return;
    }

    const data: FormularioEstudioPosgradoData = {
      paises: this.paises(),
      estudio: existente ?? null,
      existentes: this.items(),
    };

    const ref = this.dialog.open(FormularioEstudioPosgrado, {
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
    item: EstudioPosgradoGuardado,
    ref: MatDialogRef<FormularioEstudioPosgrado>
  ): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      return;
    }

    const registro: EstudioPosgrado = {
      id: item.id!,
      institucionId: item.institucionId,
      institucionNombre: item.institucionNombre,
      paisId: item.paisId,
      paisNombre: item.paisNombre,
      especialidad: item.especialidad,
      mencion: item.mencion,
      condicionAcademica: item.condicionAcademica,
      numeroSemestre: item.numeroSemestre,
      anioInicio: item.anioInicio,
      anioFin: item.anioFin,
      notas: item.notas,
      promedio: item.promedio,
      puntaje: item.puntaje,
    };

    const esActualizacion = esIdPersistidoApi(registro.id);

    this.mutarItems
      .upsertEstudioPosgrado(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion
              ? 'No se pudo actualizar el semestre'
              : 'No se pudo guardar el semestre',
            {
              mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroEstudiosPosgrado;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        ref.close();

        await this.alertas.exito(
          esActualizacion ? 'Semestre actualizado' : 'Semestre guardado',
          esActualizacion
            ? 'El semestre se actualizó correctamente.'
            : 'El semestre se guardó correctamente.'
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
              'No se pudo cargar el catálogo de países.'
          );
          return;
        }

        this.paises.set(resultado.paises);
        this.enriquecerNombresCatalogo();
      });
  }

  private hidratarRubro(rubro: RubroEstudiosPosgrado): void {
    this.items.set(rubro.items);
    this.puntajeRubro.set(rubro.puntajeTotal);
    this.puntajeChange.emit(rubro.puntajeTotal);
    this.enriquecerNombresCatalogo();
  }

  private enriquecerNombresCatalogo(): void {
    const paises = this.paises();
    if (paises.length === 0) {
      return;
    }

    this.items.update((lista) =>
      lista.map((item) => ({
        ...item,
        paisNombre: paises.find((pais) => pais.id === item.paisId)?.nombre ?? item.paisNombre,
      }))
    );
  }

  private claveRubro(rubro: RubroEstudiosPosgrado): string {
    return [
      rubro.puntajeTotal,
      rubro.items.length,
      ...rubro.items.map(
        (item) =>
          `${item.id}|${item.numeroSemestre}|${item.promedio}|${item.puntaje}|${item.notas.join(',')}`
      ),
    ].join('::');
  }
}
