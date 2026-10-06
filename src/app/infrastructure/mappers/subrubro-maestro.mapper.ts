import { SubrubroMaestro } from '../../domain/models/subrubro-maestro.model';
import { SubrubroMaestroDto } from '../dto/remote/MaestrosRubroResponse.dto';

export function toSubrubroMaestro(dto: SubrubroMaestroDto): SubrubroMaestro {
  if (dto.idSubrubro == null) {
    throw new Error('Subrubro maestro recibido sin idSubrubro');
  }

  if (dto.idRubro == null) {
    throw new Error('Subrubro maestro recibido sin idRubro');
  }

  const codigo = String(dto.codigo ?? '').trim();
  if (!codigo) {
    throw new Error('Subrubro maestro recibido sin código');
  }

  const nombre = String(dto.nombre ?? '').trim();
  if (!nombre) {
    throw new Error('Subrubro maestro recibido sin nombre');
  }

  return {
    idSubrubro: Number(dto.idSubrubro),
    idRubro: Number(dto.idRubro),
    codigo,
    nombre,
    orden: Number(dto.orden ?? 0),
    puntajeMaximo:
      dto.puntajeMaximo == null || Number.isNaN(Number(dto.puntajeMaximo))
        ? null
        : Number(dto.puntajeMaximo),
    aniosVigencia:
      dto.aniosVigencia == null || Number.isNaN(Number(dto.aniosVigencia))
        ? null
        : Number(dto.aniosVigencia),
  };
}
