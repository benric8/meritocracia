import {
  EstadoFechaValoracion,
  FechaValoracion,
  NuevaFechaValoracion,
} from '../../domain/models/fecha-valoracion.model';
import {
  FechaValoracionDto,
  RegistrarFechaValoracionRequestDto,
} from '../dto/remote/FechaValoracionResponse.dto';

function esVigente(valor: string | boolean | undefined): boolean {
  if (typeof valor === 'boolean') {
    return valor;
  }

  const normalizado = String(valor ?? '')
    .trim()
    .toUpperCase();
  return normalizado === '1' || normalizado === 'VIGENTE' || normalizado === 'TRUE';
}

function anioDesdeFecha(isoFecha: string): number {
  const anio = Number(isoFecha.slice(0, 4));
  return Number.isFinite(anio) ? anio : new Date().getFullYear();
}

export function toRegistrarFechaValoracionRequestDto(
  peticion: NuevaFechaValoracion
): RegistrarFechaValoracionRequestDto {
  return {
    fechaValoracion: peticion.fechaValoracion.trim(),
    resolucion: peticion.resolucion.trim(),
  };
}

export function toFechaValoracion(dto: FechaValoracionDto): FechaValoracion {
  if (dto.id == null) {
    throw new Error('Fecha de valoración recibida sin id');
  }

  const fechaValoracion = String(dto.fechaValoracion ?? '').trim();
  if (!fechaValoracion) {
    throw new Error('Fecha de valoración recibida sin fecha');
  }

  const estado: EstadoFechaValoracion = esVigente(dto.estado) ? 'VIGENTE' : 'INACTIVO';

  return {
    id: String(dto.id),
    fechaValoracion,
    anio: dto.anio ?? anioDesdeFecha(fechaValoracion),
    resolucion: String(dto.resolucion ?? '').trim(),
    estado,
    usuarioRegistro: String(dto.usuarioRegistro ?? dto.usuario ?? '').trim(),
    fechaRegistro: String(dto.fechaRegistro ?? '').trim(),
  };
}
