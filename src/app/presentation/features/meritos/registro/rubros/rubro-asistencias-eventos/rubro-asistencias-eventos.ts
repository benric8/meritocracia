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
import { ListarCatalogosAsistenciasEventosUseCase } from '../../../../../../application/use-cases/meritos/listar-catalogos-asistencias-eventos.use-case';
import { MutarItemsRubroAsistenciasEventosUseCase } from '../../../../../../application/use-cases/meritos/mutar-items-rubro-asistencias-eventos.use-case';
import { CatalogoItem } from '../../../../../../domain/models/catalogo-item.model';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import { CatalogoCertamen } from '../../../../../../domain/models/rubro-certamenes-academicos.model';
import {
  AsistenciaEventoAcademico,
  etiquetaEstadoAsistenciaEvento,
  etiquetaJuridicoAsistenciaEvento,
  RubroAsistenciasEventos,
} from '../../../../../../domain/models/rubro-asistencias-eventos.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { esIdPersistidoApi, formatearFechaCorta } from '../rubros.util';
import {
  AsistenciaEventoGuardada,
  FormularioAsistenciaEvento,
  FormularioAsistenciaEventoData,
} from './formulario-asistencia-evento/formulario-asistencia-evento';

@Component({
  selector: 'app-rubro-asistencias-eventos',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './rubro-asistencias-eventos.html',
  styleUrl: './rubro-asistencias-eventos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroAsistenciasEventosComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarCatalogos = inject(ListarCatalogosAsistenciasEventosUseCase);
  private readonly mutarItems = inject(MutarItemsRubroAsistenciasEventosUseCase);

  readonly fichaId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroInicial = input<RubroAsistenciasEventos | null>(null);
  readonly cargandoDetalle = input(false);

  readonly puntajeChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly cargandoCatalogos = signal(false);
  protected readonly errorCatalogos = signal<string | null>(null);
  protected readonly items = signal<AsistenciaEventoAcademico[]>([]);
  protected readonly puntajeRubro = signal(0);
  protected readonly eventos = signal<CatalogoCertamen[]>([]);
  protected readonly modalidades = signal<CatalogoCertamen[]>([]);
  protected readonly tiposDocumento = signal<CatalogoItem[]>([]);
  protected readonly paises = signal<CatalogoItem[]>([]);
  protected readonly especialidades = signal<CatalogoItem[]>([]);
  protected readonly etiquetaJuridico = etiquetaJuridicoAsistenciaEvento;
  protected readonly etiquetaEstado = etiquetaEstadoAsistenciaEvento;
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

  protected etiquetaEvento(item: AsistenciaEventoAcademico): string {
    return this.textoCatalogoCertamen(item.eventoDescripcion, item.eventoId, this.eventos());
  }

  protected etiquetaModalidad(item: AsistenciaEventoAcademico): string {
    return this.textoCatalogoCertamen(item.modalidadDescripcion, item.modalidadId, this.modalidades());
  }

  protected etiquetaInstitucion(item: AsistenciaEventoAcademico): string {
    return item.institucionNombre?.trim() || (item.institucionId ? `Id ${item.institucionId}` : '—');
  }

  protected etiquetaPais(item: AsistenciaEventoAcademico): string {
    return this.textoCatalogoItem(item.nombrePais, item.paisId, this.paises());
  }

  protected etiquetaEspecialidad(item: AsistenciaEventoAcademico): string {
    return this.textoCatalogoItem(item.especialidadDescripcion, item.especialidadId, this.especialidades());
  }

  protected etiquetaTipoDocumento(item: AsistenciaEventoAcademico): string {
    return this.textoCatalogoItem(
      item.tipoDocumentoDescripcion,
      item.tipoDocumentoId,
      this.tiposDocumento()
    );
  }

  protected onAbrirFormulario(): void {
    this.abrirModal();
  }

  protected onEditar(item: AsistenciaEventoAcademico): void {
    this.abrirModal(item);
  }

  protected async eliminarAsistencia(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar asistencia',
      html: '¿Confirma que desea eliminar esta asistencia?',
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
      .eliminarAsistencia(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar la asistencia', {
            mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroAsistenciasEventos;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito('Asistencia eliminada', 'La asistencia se eliminó correctamente.');
      });
  }

  private abrirModal(existente?: AsistenciaEventoAcademico): void {
    if (this.soloLectura()) {
      return;
    }

    const data: FormularioAsistenciaEventoData = {
      eventos: this.eventos(),
      modalidades: this.modalidades(),
      tiposDocumento: this.tiposDocumento(),
      paises: this.paises(),
      especialidades: this.especialidades(),
      asistencia: existente ?? null,
    };

    const ref = this.dialog.open(FormularioAsistenciaEvento, {
      width: '860px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const sub = ref.componentInstance.guardar.subscribe((item) => {
      this.onGuardarAsistencia(item, ref);
    });
    ref.afterClosed().subscribe(() => sub.unsubscribe());
  }

  private onGuardarAsistencia(
    item: AsistenciaEventoGuardada,
    ref: MatDialogRef<FormularioAsistenciaEvento>
  ): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      return;
    }

    const registro: AsistenciaEventoAcademico = {
      id: item.id!,
      eventoId: item.eventoId,
      eventoDescripcion: item.eventoDescripcion,
      institucionId: item.institucionId,
      institucionNombre: item.institucionNombre,
      paisId: item.paisId,
      nombrePais: item.nombrePais,
      fechaInicio: item.fechaInicio,
      fechaFin: item.fechaFin,
      juridico: item.juridico,
      especialidadId: item.especialidadId,
      especialidadDescripcion: item.especialidadDescripcion,
      tema: item.tema,
      modalidadId: item.modalidadId,
      modalidadDescripcion: item.modalidadDescripcion,
      tipoDocumentoId: item.tipoDocumentoId,
      tipoDocumentoDescripcion: item.tipoDocumentoDescripcion,
      archivoId: item.archivoId,
      puntaje: item.puntaje,
    };

    const esActualizacion = esIdPersistidoApi(registro.id);

    this.mutarItems
      .upsertAsistencia(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion
              ? 'No se pudo actualizar la asistencia'
              : 'No se pudo guardar la asistencia',
            {
              mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroAsistenciasEventos;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        ref.close();

        await this.alertas.exito(
          esActualizacion ? 'Asistencia actualizada' : 'Asistencia guardada',
          esActualizacion
            ? 'La asistencia se actualizó correctamente.'
            : 'La asistencia se guardó correctamente.'
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
              'No se pudieron cargar los catálogos de asistencia a eventos académicos.'
          );
          return;
        }

        this.eventos.set(resultado.catalogos.eventos);
        this.modalidades.set(resultado.catalogos.modalidades);
        this.tiposDocumento.set(resultado.catalogos.tiposDocumento);
        this.paises.set(resultado.catalogos.paises);
        this.especialidades.set(resultado.catalogos.especialidades);
      });
  }

  private hidratarRubro(rubro: RubroAsistenciasEventos): void {
    this.items.set(rubro.items);
    this.puntajeRubro.set(rubro.puntajeTotal);
    this.puntajeChange.emit(rubro.puntajeTotal);
  }

  private claveRubro(rubro: RubroAsistenciasEventos): string {
    return [
      rubro.puntajeTotal,
      rubro.items.length,
      ...rubro.items.map(
        (item) =>
          `${item.id}|${item.fechaFin}|${item.puntaje}|${item.institucionNombre}|${item.eventoDescripcion}|${item.especialidadDescripcion}|${item.modalidadDescripcion}|${item.tipoDocumentoDescripcion}|${item.tema}|${item.juridico}`
      ),
    ].join('::');
  }

  private textoCatalogoCertamen(
    descripcion: string,
    id: string,
    catalogo: CatalogoCertamen[]
  ): string {
    const texto = descripcion?.trim();
    if (texto) {
      return texto;
    }
    return catalogo.find((item) => item.id === id)?.descripcion || (id ? `Id ${id}` : '—');
  }

  private textoCatalogoItem(descripcion: string, id: string, catalogo: CatalogoItem[]): string {
    const texto = descripcion?.trim();
    if (texto) {
      return texto;
    }
    return catalogo.find((item) => item.id === id)?.nombre || (id ? `Id ${id}` : '—');
  }
}
