import { RubroMaestro } from '../../domain/models/rubro-maestro.model';
import { RubroMaestroDto } from '../dto/remote/MaestrosRubroResponse.dto';

export function toRubroMaestro(dto: RubroMaestroDto): RubroMaestro {
  if (dto.idRubro == null) {
    throw new Error('Rubro maestro recibido sin idRubro');
  }

  const codigo = String(dto.codigo ?? '').trim();
  if (!codigo) {
    throw new Error('Rubro maestro recibido sin código');
  }

  const nombre = String(dto.nombre ?? '').trim();
  if (!nombre) {
    throw new Error('Rubro maestro recibido sin nombre');
  }

  return {
    idRubro: Number(dto.idRubro),
    codigo,
    nombre,
    orden: Number(dto.orden ?? 0),
    puntajeMaximo:
      dto.puntajeMaximo == null || Number.isNaN(Number(dto.puntajeMaximo))
        ? null
        : Number(dto.puntajeMaximo),
    tieneDetalle: Boolean(dto.tieneDetalle),
    tieneSubrubros: Boolean(dto.tieneSubrubros),
  };
}
