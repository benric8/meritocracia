import { FichaResumen } from '../../domain/models/ficha-consulta.model';
import { FichaResumenDto } from '../dto/remote/FichaResumenResponse.dto';

export function toFichaResumen(dto: FichaResumenDto): FichaResumen {
  return {
    id: String(dto.idFicha),
    dni: String(dto.dni ?? ''),
    nombres: dto.nombres ?? '',
    apellidoPaterno: dto.apellidoPaterno ?? '',
    apellidoMaterno: dto.apellidoMaterno ?? '',
    nombreCompleto: dto.nombreCompleto ?? '',
    fechaValoracion: dto.fechaValoracion ?? '',
    completada: String(dto.completado) === '1',
    activa: String(dto.activo) === '1',
  };
}
