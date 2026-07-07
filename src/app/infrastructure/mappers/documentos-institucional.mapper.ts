import {
  DocumentoInstitucional,
  TipoDocumentoInstitucional,
} from '../../domain/models/documento-institucional.model';
import { DocumentoInstitucionalDto } from '../dto/remote/DocumentoInstitucionalResponse.dto';

const TIPOS_VALIDOS = new Set<TipoDocumentoInstitucional>(['RESOLUCION', 'LINEAMIENTO']);

function normalizarTipo(tipo: string | undefined): TipoDocumentoInstitucional {
  const valor = (tipo ?? '').toUpperCase();
  if (!TIPOS_VALIDOS.has(valor as TipoDocumentoInstitucional)) {
    throw new Error(`Tipo de documento institucional inválido recibido del API: "${tipo}"`);
  }
  return valor as TipoDocumentoInstitucional;
}

export function toDocumentoInstitucional(dto: DocumentoInstitucionalDto): DocumentoInstitucional {
  if (dto.id == null) {
    throw new Error('Documento institucional recibido sin id');
  }
  return {
    id: dto.id != null ? String(dto.id) : '',
    tipo: normalizarTipo(dto.tipoDocumento),
    nombreArchivo: dto.nombreDocumento ?? '',
    fechaPublicacion: dto.fechaRegistro ?? dto.fechaRegistro ?? new Date().toISOString(),
    usuarioPublicacion: dto.usuarioRegistra ?? '',
  };
} 