import { NivelOfimaticaCatalogo } from '../../domain/models/rubro-ofimatica.model';
import { NivelOfimaticaItemDto } from '../dto/remote/MaestrosOfimaticaResponse.dto';

export function toNivelOfimaticaDesdeDto(dto: NivelOfimaticaItemDto): NivelOfimaticaCatalogo {
  if (dto.id == null) {
    throw new Error('Nivel de ofimática recibido sin id');
  }

  const codigo = String(dto.codigo ?? '').trim();
  const descripcion = String(dto.descripcion ?? codigo).trim();
  if (!codigo || !descripcion) {
    throw new Error('Nivel de ofimática recibido sin código o descripción');
  }

  return {
    id: String(dto.id),
    codigo,
    descripcion,
  };
}
