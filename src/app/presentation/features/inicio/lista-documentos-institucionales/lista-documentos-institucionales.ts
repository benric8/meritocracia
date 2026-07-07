import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DescargarDocumentoInstitucionalUseCase } from '../../../../application/use-cases/inicio/descargar-documento-institucional.use-case';
import { ListarDocumentosInstitucionalesUseCase } from '../../../../application/use-cases/inicio/listar-documentos-institucionales.use-case';
import {
  DocumentoInstitucional,
  ETIQUETAS_TIPO_DOCUMENTO,
  TipoDocumentoInstitucional,
} from '../../../../domain/models/documento-institucional.model';
import { PAGINACION_POR_DEFECTO } from '../../../../domain/models/paginacion.model';

interface VistaPreviaActiva {
  titulo: string;
  url: SafeResourceUrl | null;
  cargando: boolean;
}

@Component({
  selector: 'app-lista-documentos-institucionales',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatPaginatorModule],
  templateUrl: './lista-documentos-institucionales.html',
  styleUrl: './lista-documentos-institucionales.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaDocumentosInstitucionales implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly listarDocumentos = inject(ListarDocumentosInstitucionalesUseCase);
  private readonly descargarDocumento = inject(DescargarDocumentoInstitucionalUseCase);

  private blobVistaPrevia: string | null = null;

  readonly permitirReemplazo = input(false);
  readonly solicitarReemplazo = output<DocumentoInstitucional>();

  protected readonly documentos = signal<DocumentoInstitucional[]>([]);
  protected readonly paginaActual = signal(PAGINACION_POR_DEFECTO.pagina);
  protected readonly tamanioPagina = signal(PAGINACION_POR_DEFECTO.tamanio);
  protected readonly totalRegistros = signal(0);
  protected readonly opcionesTamanioPagina = [5, 10, 20];
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly vistaPrevia = signal<VistaPreviaActiva | null>(null);
  protected readonly previsualizandoId = signal<string | null>(null);

  constructor() {
    this.destroyRef.onDestroy(() => this.cerrarVistaPrevia());
  }

  ngOnInit(): void {
    this.cargar();
  }

  recargar(pagina = PAGINACION_POR_DEFECTO.pagina): void {
    this.paginaActual.set(pagina);
    this.cargar(pagina);
  }

  protected onPaginaCambiada(evento: PageEvent): void {
    this.paginaActual.set(evento.pageIndex + 1);
    this.tamanioPagina.set(evento.pageSize);
    this.cargar();
  }

  protected descargar(documento: DocumentoInstitucional): void {
    this.error.set(null);
    this.descargarDocumento
      .ejecutar(documento.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => this.dispararDescarga(blob, documento.nombreArchivo),
        error: () => this.error.set('No se pudo descargar el documento.'),
      });
  }

  protected verVistaPrevia(documento: DocumentoInstitucional): void {
    this.error.set(null);
    this.previsualizandoId.set(documento.id);
    this.vistaPrevia.set({
      titulo: documento.nombreArchivo,
      url: null,
      cargando: true,
    });

    this.descargarDocumento
      .ejecutar(documento.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.previsualizandoId.set(null))
      )
      .subscribe({
        next: (blob) => {
          this.revocarBlobVistaPrevia();
          this.blobVistaPrevia = URL.createObjectURL(blob);
          this.vistaPrevia.set({
            titulo: documento.nombreArchivo,
            url: this.sanitizer.bypassSecurityTrustResourceUrl(this.blobVistaPrevia),
            cargando: false,
          });
        },
        error: () => {
          this.cerrarVistaPrevia();
          this.error.set('No se pudo cargar la vista previa del documento.');
        },
      });
  }

  protected cerrarVistaPrevia(): void {
    this.revocarBlobVistaPrevia();
    this.vistaPrevia.set(null);
  }

  protected etiquetaTipo(tipo: TipoDocumentoInstitucional): string {
    return ETIQUETAS_TIPO_DOCUMENTO[tipo];
  }

  protected fechaFormateada(iso: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso));
  }

  private cargar(pagina = this.paginaActual()): void {
    this.cargando.set(true);
    this.error.set(null);

    this.listarDocumentos
      .ejecutar({ pagina, tamanio: this.tamanioPagina() })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: (resultado) => {
          this.documentos.set(resultado.elementos);
          this.totalRegistros.set(resultado.totalRegistros);
          this.paginaActual.set(resultado.paginaActual);
          this.tamanioPagina.set(resultado.tamanioPagina);

          if (resultado.elementos.length === 0 && resultado.totalRegistros > 0 && pagina > 1) {
            this.recargar(pagina - 1);
          }
        },
        error: () => this.error.set('No se pudieron cargar los documentos.'),
      });
  }

  private dispararDescarga(blob: Blob, nombreArchivo: string): void {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo.endsWith('.pdf') ? nombreArchivo : `${nombreArchivo}.pdf`;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  private revocarBlobVistaPrevia(): void {
    if (this.blobVistaPrevia) {
      URL.revokeObjectURL(this.blobVistaPrevia);
      this.blobVistaPrevia = null;
    }
  }
}
