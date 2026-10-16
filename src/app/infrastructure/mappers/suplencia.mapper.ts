import {
  FichaSuplencia,
  MotivoSuplencia,
  RegistradorSuplente,
  SuplenciaAsignada,
} from '../../domain/models/suplencia.model';
import {
  MotivoSuplenciaDto,
  RegistradorSuplenteDto,
  SuplenciaAsignadaDto,
  SuplenciaFichaDto,
} from '../dto/remote/SuplenciaResponse.dto';

export function toFichaSuplencia(dto: SuplenciaFichaDto): FichaSuplencia {
  return {
    fichaId: String(dto.idFicha),
    fechaValoracion: dto.fechaValoracion ?? '',
    registradorTitularId: dto.idRegistradorTitular,
    codigoRegistradorTitular: dto.codigoRegistradorTitular ?? '',
    nombreRegistradorTitular: dto.nombreRegistradorTitular ?? '',
    dniMagistrado: dto.dniMagistrado != null ? String(dto.dniMagistrado) : '',
    nombreMagistrado: dto.nombreMagistrado ?? '',
    suplenciaId: dto.idSuplencia != null ? String(dto.idSuplencia) : null,
    registradorSuplenteId: dto.idRegistradorSuplente ?? null,
    codigoRegistradorSuplente: dto.codigoRegistradorSuplente ?? null,
    nombreRegistradorSuplente: dto.nombreRegistradorSuplente ?? null,
    motivo: dto.motivo ?? null,
    motivoDescripcion: dto.motivoDescripcion ?? null,
    fechaInicioSuplencia: dto.fechaInicioSuplencia ?? null,
  };
}

export function toRegistradorSuplente(dto: RegistradorSuplenteDto): RegistradorSuplente {
  return {
    id: dto.idUsuario,
    usuario: dto.usuario ?? '',
    nombreCompleto: dto.nombreCompleto ?? '',
  };
}

export function toMotivoSuplencia(dto: MotivoSuplenciaDto): MotivoSuplencia {
  return {
    codigo: dto.codigo,
    descripcion: dto.descripcion ?? dto.codigo,
  };
}

export function toSuplenciaAsignada(dto: SuplenciaAsignadaDto): SuplenciaAsignada {
  return {
    suplenciaId: String(dto.idSuplencia),
    fichaId: String(dto.idFicha),
    registradorSuplenteId: dto.idRegistradorSuplente,
    motivo: dto.motivo,
    motivoDescripcion: dto.motivoDescripcion ?? dto.motivo,
    fechaInicio: dto.fechaInicio ?? null,
  };
}
