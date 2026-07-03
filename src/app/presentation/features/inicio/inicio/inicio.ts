import { DecimalPipe } from '@angular/common';
import { Component, computed, DestroyRef, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { DescargarDocumentoInstitucionalUseCase } from '../../../../application/use-cases/inicio/descargar-documento-institucional.use-case';
import { GuardarDocumentoInstitucionalUseCase } from '../../../../application/use-cases/inicio/guardar-documento-institucional.use-case';
import { ListarDocumentosInstitucionalesUseCase } from '../../../../application/use-cases/inicio/listar-documentos-institucionales.use-case';
import {
  formatearTamanoBytes,
  validarArchivoPdf,
} from '../../../../domain/commons/validacion-archivo-pdf';
import {
  DocumentoInstitucional,
  ETIQUETAS_TIPO_DOCUMENTO,
  TipoDocumentoInstitucional,
} from '../../../../domain/models/documento-institucional.model';
import { obtenerConfigDocumentosInstitucionales } from '../../../../infrastructure/config/documentos-institucionales.config';
import { AuthStore } from '../../../../infrastructure/security/stores/auth.store';
import {
  accesosRapidosPorPerfil,
  configInicioPorPerfil,
  textoBienvenidaPorPerfil,
  tituloAccesosRapidos,
} from '../inicio-perfil.config';

interface Estadistica {
  etiqueta: string;
  valor: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DecimalPipe,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly listarDocumentos = inject(ListarDocumentosInstitucionalesUseCase);
  private readonly guardarDocumento = inject(GuardarDocumentoInstitucionalUseCase);
  private readonly descargarDocumento = inject(DescargarDocumentoInstitucionalUseCase);

  private readonly inputArchivo = viewChild<ElementRef<HTMLInputElement>>('inputArchivo');

  protected readonly tiposDocumento = Object.entries(ETIQUETAS_TIPO_DOCUMENTO) as [
    TipoDocumentoInstitucional,
    string,
  ][];
  protected readonly tamanoMaximoEtiqueta = formatearTamanoBytes(
    obtenerConfigDocumentosInstitucionales().maxTamanoBytes
  );

  protected readonly configInicio = computed(() => configInicioPorPerfil(this.authStore.perfil()));
  protected readonly mostrarEstadisticas = computed(() => this.configInicio()?.mostrarEstadisticas ?? false);
  protected readonly puedeGestionarResoluciones = computed(
    () => this.configInicio()?.puedeGestionarResoluciones ?? false
  );
  protected readonly textoBienvenida = computed(() => textoBienvenidaPorPerfil(this.authStore.perfil()));
  protected readonly tituloAccesos = computed(() => tituloAccesosRapidos(this.authStore.perfil()));
  protected readonly accesosRapidos = computed(() => accesosRapidosPorPerfil(this.authStore.perfil()));

  protected readonly estadisticas = signal<Estadistica[]>([
    { etiqueta: 'Fichas activas', valor: '248' },
    { etiqueta: 'Jueces Supremos', valor: '36' },
    { etiqueta: 'Superiores Titulares', valor: '212' },
  ]);

  protected readonly documentos = signal<DocumentoInstitucional[]>([]);
  protected readonly cargandoDocumentos = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorDocumentos = signal<string | null>(null);
  protected readonly errorFormulario = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);
  protected readonly archivoSeleccionado = signal<File | null>(null);
  protected readonly arrastrando = signal(false);
  protected readonly documentoEnEdicion = signal<DocumentoInstitucional | null>(null);

  protected readonly formDocumento = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(200)]],
    tipo: ['RESOLUCION' as TipoDocumentoInstitucional, Validators.required],
  });

  ngOnInit(): void {
    this.cargarDocumentos();
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

  protected abrirSelectorArchivo(): void {
    this.inputArchivo()?.nativeElement.click();
  }

  protected onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (archivo) {
      this.asignarArchivo(archivo);
    }
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(false);
    const archivo = event.dataTransfer?.files?.[0];
    if (archivo) {
      this.asignarArchivo(archivo);
    }
  }

  protected iniciarReemplazo(documento: DocumentoInstitucional): void {
    this.documentoEnEdicion.set(documento);
    this.archivoSeleccionado.set(null);
    this.errorFormulario.set(null);
    this.mensajeExito.set(null);
    this.formDocumento.setValue({
      nombre: documento.nombre,
      tipo: documento.tipo,
    });
  }

  protected cancelarEdicion(): void {
    this.documentoEnEdicion.set(null);
    this.archivoSeleccionado.set(null);
    this.errorFormulario.set(null);
    this.formDocumento.reset({ nombre: '', tipo: 'RESOLUCION' });
  }

  protected guardar(): void {
    this.errorFormulario.set(null);
    this.mensajeExito.set(null);

    if (this.formDocumento.invalid) {
      this.formDocumento.markAllAsTouched();
      this.errorFormulario.set('Complete el nombre y el tipo del documento.');
      return;
    }

    const archivo = this.archivoSeleccionado();
    if (!archivo) {
      this.errorFormulario.set('Debe seleccionar un archivo PDF.');
      return;
    }

    const validacion = validarArchivoPdf(archivo, obtenerConfigDocumentosInstitucionales());
    if (!validacion.valido) {
      this.errorFormulario.set(validacion.mensaje ?? 'Archivo no válido.');
      return;
    }

    const { nombre, tipo } = this.formDocumento.getRawValue();
    const usuario = this.authStore.usuario() ?? 'admin';
    const edicion = this.documentoEnEdicion();

    this.guardando.set(true);
    this.guardarDocumento
      .ejecutar({ nombre, tipo, archivo }, usuario, edicion?.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false))
      )
      .subscribe({
        next: (resultado) => {
          if (!resultado.exito) {
            this.errorFormulario.set(resultado.mensaje ?? 'No se pudo guardar el documento.');
            return;
          }
          this.mensajeExito.set(
            edicion ? 'Documento reemplazado correctamente.' : 'Documento publicado correctamente.'
          );
          this.cancelarEdicion();
          this.cargarDocumentos();
        },
        error: () => this.errorFormulario.set('Ocurrió un error al guardar el documento.'),
      });
  }

  protected descargar(documento: DocumentoInstitucional): void {
    this.errorDocumentos.set(null);
    this.descargarDocumento
      .ejecutar(documento.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => this.dispararDescarga(blob, documento.nombreArchivo),
        error: () => this.errorDocumentos.set('No se pudo descargar el documento.'),
      });
  }

  private cargarDocumentos(): void {
    this.cargandoDocumentos.set(true);
    this.errorDocumentos.set(null);
    this.listarDocumentos
      .ejecutar()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoDocumentos.set(false))
      )
      .subscribe({
        next: (lista) => this.documentos.set(lista),
        error: () => this.errorDocumentos.set('No se pudieron cargar los documentos.'),
      });
  }

  private asignarArchivo(archivo: File): void {
    const validacion = validarArchivoPdf(archivo, obtenerConfigDocumentosInstitucionales());
    if (!validacion.valido) {
      this.archivoSeleccionado.set(null);
      this.errorFormulario.set(validacion.mensaje ?? 'Archivo no válido.');
      return;
    }
    this.archivoSeleccionado.set(archivo);
    this.errorFormulario.set(null);
    if (!this.formDocumento.controls.nombre.value.trim()) {
      const nombreSinExtension = archivo.name.replace(/\.pdf$/i, '');
      this.formDocumento.controls.nombre.setValue(nombreSinExtension);
    }
  }

  private dispararDescarga(blob: Blob, nombreArchivo: string): void {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo.endsWith('.pdf') ? nombreArchivo : `${nombreArchivo}.pdf`;
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
