import { ArchivoDescargado } from '../../../domain/models/reporte-descarga.model';

/** Dispara la descarga del archivo en el navegador con el nombre que mandó el servidor. */
export function guardarArchivoDescargado({ nombre, contenido }: ArchivoDescargado): void {
  const url = URL.createObjectURL(contenido);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}
