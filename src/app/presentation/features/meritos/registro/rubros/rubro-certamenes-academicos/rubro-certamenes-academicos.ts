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
import { ListarCatalogosCertamenesAcademicosUseCase } from '../../../../../../application/use-cases/meritos/listar-catalogos-certamenes-academicos.use-case';
import { MutarItemsRubroCertamenesAcademicosUseCase } from '../../../../../../application/use-cases/meritos/mutar-items-rubro-certamenes-academicos.use-case';
import { CatalogoItem } from '../../../../../../domain/models/catalogo-item.model';
import { FichaValoracion } from '../../../../../../domain/models/ficha-valoracion.model';
import {
  CatalogoCertamen,
  CertamenAcademico,
  etiquetaEstadoCertamen,
  etiquetaJuridicoCertamen,
  RubroCertamenesAcademicos,
} from '../../../../../../domain/models/rubro-certamenes-academicos.model';
import { ALERTAS_PORT } from '../../../../../../domain/ports/alertas.port';
import { esIdPersistidoApi, formatearFechaCorta } from '../rubros.util';
import {
  CertamenAcademicoGuardado,
  FormularioCertamenAcademico,
  FormularioCertamenAcademicoData,
} from './formulario-certamen-academico/formulario-certamen-academico';

@Component({
  selector: 'app-rubro-certamenes-academicos',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './rubro-certamenes-academicos.html',
  styleUrl: './rubro-certamenes-academicos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubroCertamenesAcademicosComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly alertas = inject(ALERTAS_PORT);
  private readonly listarCatalogos = inject(ListarCatalogosCertamenesAcademicosUseCase);
  private readonly mutarItems = inject(MutarItemsRubroCertamenesAcademicosUseCase);

  readonly fichaId = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly rubroInicial = input<RubroCertamenesAcademicos | null>(null);
  readonly cargandoDetalle = input(false);

  readonly puntajeChange = output<number>();
  readonly fichaActualizada = output<FichaValoracion>();

  protected readonly cargandoCatalogos = signal(false);
  protected readonly errorCatalogos = signal<string | null>(null);
  protected readonly items = signal<CertamenAcademico[]>([]);
  protected readonly puntajeRubro = signal(0);
  protected readonly eventos = signal<CatalogoCertamen[]>([]);
  protected readonly modalidades = signal<CatalogoCertamen[]>([]);
  protected readonly tiposParticipacion = signal<CatalogoCertamen[]>([]);
  protected readonly paises = signal<CatalogoItem[]>([]);
  protected readonly especialidades = signal<CatalogoItem[]>([]);
  protected readonly etiquetaJuridico = etiquetaJuridicoCertamen;
  protected readonly etiquetaEstado = etiquetaEstadoCertamen;
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

  protected etiquetaInstitucion(item: CertamenAcademico): string {
    return item.institucionNombre?.trim() || `Id ${item.institucionId}`;
  }

  protected onAbrirFormulario(): void {
    this.abrirModal();
  }

  protected onEditar(item: CertamenAcademico): void {
    this.abrirModal(item);
  }

  protected async eliminarCertamen(id: string): Promise<void> {
    const ok = await this.alertas.confirmar({
      icono: 'warning',
      titulo: 'Eliminar certamen',
      html: '¿Confirma que desea eliminar este certamen?',
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
      .eliminarCertamen(fichaId, id)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error('No se pudo eliminar el certamen', {
            mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
            codigo: resultado.detalle?.codigo,
            codigoOperacion: resultado.detalle?.codigoOperacion,
          });
          return;
        }

        const rubro = resultado.ficha.rubroCertamenesAcademicos;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        await this.alertas.exito('Certamen eliminado', 'El certamen se eliminó correctamente.');
      });
  }

  private abrirModal(existente?: CertamenAcademico): void {
    if (this.soloLectura()) {
      return;
    }

    const data: FormularioCertamenAcademicoData = {
      eventos: this.eventos(),
      modalidades: this.modalidades(),
      tiposParticipacion: this.tiposParticipacion(),
      paises: this.paises(),
      especialidades: this.especialidades(),
      certamen: existente ?? null,
    };

    const ref = this.dialog.open(FormularioCertamenAcademico, {
      width: '860px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      panelClass: 'mc-dialog-panel',
      data,
    });

    const sub = ref.componentInstance.guardar.subscribe((item) => {
      this.onGuardarCertamen(item, ref);
    });
    ref.afterClosed().subscribe(() => sub.unsubscribe());
  }

  private onGuardarCertamen(
    item: CertamenAcademicoGuardado,
    ref: MatDialogRef<FormularioCertamenAcademico>
  ): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      return;
    }

    const registro: CertamenAcademico = {
      id: item.id!,
      eventoId: item.eventoId,
      eventoDescripcion: item.eventoDescripcion,
      tipoParticipacionId: item.tipoParticipacionId,
      tipoParticipacionDescripcion: item.tipoParticipacionDescripcion,
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
      archivoId: item.archivoId,
      puntaje: item.puntaje,
    };

    const esActualizacion = esIdPersistidoApi(registro.id);

    this.mutarItems
      .upsertCertamen(fichaId, registro)
      .pipe(take(1))
      .subscribe(async (resultado) => {
        if (!resultado.exito) {
          void this.alertas.error(
            esActualizacion ? 'No se pudo actualizar el certamen' : 'No se pudo guardar el certamen',
            {
              mensaje: resultado.detalle?.mensaje ?? resultado.mensaje ?? 'Error desconocido.',
              codigo: resultado.detalle?.codigo,
              codigoOperacion: resultado.detalle?.codigoOperacion,
            }
          );
          return;
        }

        const rubro = resultado.ficha.rubroCertamenesAcademicos;
        if (rubro) {
          this.hidratarRubro(rubro);
          this.ultimoRubroHidratadoClave = this.claveRubro(rubro);
        }

        this.fichaActualizada.emit(resultado.ficha);
        ref.close();

        await this.alertas.exito(
          esActualizacion ? 'Certamen actualizado' : 'Certamen guardado',
          esActualizacion
            ? 'El certamen se actualizó correctamente.'
            : 'El certamen se guardó correctamente.'
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
              'No se pudieron cargar los catálogos de certámenes académicos.'
          );
          return;
        }

        this.eventos.set(resultado.catalogos.eventos);
        this.modalidades.set(resultado.catalogos.modalidades);
        this.tiposParticipacion.set(resultado.catalogos.tiposParticipacion);
        this.paises.set(resultado.catalogos.paises);
        this.especialidades.set(resultado.catalogos.especialidades);
      });
  }

  private hidratarRubro(rubro: RubroCertamenesAcademicos): void {
    this.items.set(rubro.items);
    this.puntajeRubro.set(rubro.puntajeTotal);
    this.puntajeChange.emit(rubro.puntajeTotal);
  }

  private claveRubro(rubro: RubroCertamenesAcademicos): string {
    return [
      rubro.puntajeTotal,
      rubro.items.length,
      ...rubro.items.map(
        (item) =>
          `${item.id}|${item.fechaFin}|${item.puntaje}|${item.institucionNombre}|${item.eventoDescripcion}|${item.tipoParticipacionDescripcion}|${item.especialidadDescripcion}|${item.modalidadDescripcion}|${item.tema}|${item.juridico}`
      ),
    ].join('::');
  }
}
