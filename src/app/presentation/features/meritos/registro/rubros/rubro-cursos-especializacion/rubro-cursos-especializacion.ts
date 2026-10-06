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
import { ListarCatalogosCursosEspecializacionUseCase } from '../../../../../../application/use-cases/meritos/listar-catalogos-cursos-especializacion.use-case';
import { MutarItemsRubroCursosEspecializacionUseCase } from '../../../../../../application/use-cases/meritos/mutar-items-rubro-cursos-especializacion.use-case';
import { CatalogoItem } from '../../../../../../domain/models/catalogo-item.model';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import {
  CursoEspecializacion,
  etiquetaEstadoCurso,
  etiquetaJuridicoCurso,
  RubroCursosEspecializacion,
  TipoCursoEspecializacionCatalogo,
} from '../../../../../../domain/models/rubro-cursos-especializacion.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { esIdPersistidoApi, formatearFechaCorta } from '../rubros.util';
import {
  CursoEspecializacionGuardado,
  FormularioCursoEspecializacion,
  FormularioCursoEspecializacionData,
} from './formulario-curso-especializacion/formulario-curso-especializacion';

@Component({
  selector: 'app-rubro-cursos-especializacion',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './rubro-cursos-especializacion.html',
  styleUrl: './rubro-cursos-especializacion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroCursosEspecializacionComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarCatalogos = inject(ListarCatalogosCursosEspecializacionUseCase);
  private readonly mutarItems = inject(MutarItemsRubroCursosEspecializacionUseCase);

  readonly fichaId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroInicial = input<RubroCursosEspecializacion | null>(null);
  readonly cargandoDetalle = input(false);

  readonly puntajeChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly cargandoCatalogos = signal(false);
  protected readonly errorCatalogos = signal<string | null>(null);
  protected readonly items = signal<CursoEspecializacion[]>([]);
  protected readonly puntajeRubro = signal(0);
  protected readonly tipos = signal<TipoCursoEspecializacionCatalogo[]>([]);
  protected readonly paises = signal<CatalogoItem[]>([]);
  protected readonly especialidades = signal<CatalogoItem[]>([]);
  protected readonly etiquetaJuridico = etiquetaJuridicoCurso;
  protected readonly etiquetaEstado = etiquetaEstadoCurso;
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

  protected etiquetaInstitucion(item: CursoEspecializacion): string {
    return item.institucionNombre?.trim() || `Id ${item.institucionId}`;
  }

  protected onAbrirFormulario(): void {
    this.abrirModal();
  }

  protected onEditar(item: CursoEspecializacion): void {
    this.abrirModal(item);
  }

  protected async eliminarCurso(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar curso',
      html: '¿Confirma que desea eliminar este curso?',
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
      .eliminarCurso(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar el curso', {
            mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroCursosEspecializacion;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito('Curso eliminado', 'El curso se eliminó correctamente.');
      });
  }

  private abrirModal(existente?: CursoEspecializacion): void {
    if (this.soloLectura()) {
      return;
    }

    const data: FormularioCursoEspecializacionData = {
      tipos: this.tipos(),
      paises: this.paises(),
      especialidades: this.especialidades(),
      curso: existente ?? null,
    };

    const ref = this.dialog.open(FormularioCursoEspecializacion, {
      width: '860px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const sub = ref.componentInstance.guardar.subscribe((item) => {
      this.onGuardarCurso(item, ref);
    });
    ref.afterClosed().subscribe(() => sub.unsubscribe());
  }

  private onGuardarCurso(
    item: CursoEspecializacionGuardado,
    ref: MatDialogRef<FormularioCursoEspecializacion>
  ): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      return;
    }

    const registro: CursoEspecializacion = {
      id: item.id!,
      tipoCursoEspecializacionId: item.tipoCursoEspecializacionId,
      tipoCursoEspecializacionDescripcion: item.tipoCursoEspecializacionDescripcion,
      nombreCurso: item.nombreCurso,
      institucionId: item.institucionId,
      institucionNombre: item.institucionNombre,
      paisId: item.paisId,
      nombrePais: item.nombrePais,
      fechaInicio: item.fechaInicio,
      fechaFin: item.fechaFin,
      juridico: item.juridico,
      especialidadId: item.especialidadId,
      especialidadDescripcion: item.especialidadDescripcion,
      tiempoHoras: item.tiempoHoras,
      archivoId: item.archivoId,
      puntaje: item.puntaje,
      trasladoEvento: item.trasladoEvento,
    };

    const esActualizacion = esIdPersistidoApi(registro.id);

    this.mutarItems
      .upsertCurso(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion ? 'No se pudo actualizar el curso' : 'No se pudo guardar el curso',
            {
              mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroCursosEspecializacion;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        ref.close();

        await this.alertas.exito(
          esActualizacion ? 'Curso actualizado' : 'Curso guardado',
          esActualizacion
            ? 'El curso se actualizó correctamente.'
            : 'El curso se guardó correctamente.'
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
              'No se pudieron cargar los catálogos de cursos de especialización.'
          );
          return;
        }

        this.tipos.set(resultado.catalogos.tipos);
        this.paises.set(resultado.catalogos.paises);
        this.especialidades.set(resultado.catalogos.especialidades);
      });
  }

  private hidratarRubro(rubro: RubroCursosEspecializacion): void {
    this.items.set(rubro.items);
    this.puntajeRubro.set(rubro.puntajeTotal);
    this.puntajeChange.emit(rubro.puntajeTotal);
  }

  private claveRubro(rubro: RubroCursosEspecializacion): string {
    return [
      rubro.puntajeTotal,
      rubro.items.length,
      ...rubro.items.map(
        (item) =>
          `${item.id}|${item.fechaFin}|${item.puntaje}|${item.trasladoEvento}|${item.institucionNombre}|${item.tipoCursoEspecializacionDescripcion}|${item.especialidadDescripcion}|${item.nombreCurso}|${item.tiempoHoras}|${item.juridico}`
      ),
    ].join('::');
  }
}
