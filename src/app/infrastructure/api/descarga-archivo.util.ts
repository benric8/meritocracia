import { HttpResponse } from '@angular/common/http';
import { ErrorNegocioApi } from '../../domain/errors/error-negocio-api';
import {
  ArchivoDescargado,
  FormatoDescargaCuadro,
} from '../../domain/models/reporte-descarga.model';
import { esRespuestaApi } from './api-error.model';
import { nombreArchivoDeContentDisposition } from './content-disposition.util';
import { detalleDesdeRespuestaApi } from './http-error.util';

export const TIPOS_ARCHIVO_CUADRO: Record<
  FormatoDescargaCuadro,
  { mime: string; extension: string }
> = {
  excel: {
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx',
  },
  pdf: { mime: 'application/pdf', extension: 'pdf' },
};

/**
 * Convierte la respuesta blob de una descarga en archivo.
 * Los errores de negocio llegan con HTTP 200 y un `GlobalResponse` JSON en lugar
 * del archivo: sin esta revisión se guardaría un ".xlsx" que no abre.
 */
export async function aArchivoDescargado(
  respuesta: HttpResponse<Blob>,
  nombrePorDefecto: string
): Promise<ArchivoDescargado> {
  const contenido = respuesta.body ?? new Blob();
  const tipo = respuesta.headers.get('Content-Type') ?? contenido.type;

  if (tipo.includes('application/json')) {
    let cuerpo: unknown = null;
    try {
      cuerpo = JSON.parse(await contenido.text());
    } catch {
      // Cuerpo no interpretable: se usa el mensaje por defecto.
    }
    throw new ErrorNegocioApi(
      esRespuestaApi(cuerpo)
        ? detalleDesdeRespuestaApi(cuerpo)
        : { mensaje: 'No se pudo generar el archivo.' }
    );
  }

  return {
    nombre:
      nombreArchivoDeContentDisposition(respuesta.headers.get('Content-Disposition')) ??
      nombrePorDefecto,
    contenido,
  };
}
