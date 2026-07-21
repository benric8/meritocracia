import { BaseResponse } from './BaseResponse,dto';

/** Ítem genérico `{ id, descripcion }` (provisionalidad, anterior, especialidades). */
export interface MaestroDescripcionDto {
  id: number | string;
  descripcion?: string;
  nombre?: string;
  activo?: string | boolean;
}

export interface CargoMagistradoDto {
  id: number | string;
  descripcion?: string;
  idNivel?: number | string;
  nivelDescripcion?: string;
  idCondicion?: number | string;
  condicionDescripcion?: string;
  idCargoAnterior?: number | string | null;
  evaluado?: string | boolean;
  activo?: string | boolean;
}

export interface ColegioProfesionalDto {
  id: number | string;
  codigo?: string;
  nombre?: string;
  sigla?: string;
  activo?: string | boolean;
}

export interface DistritoJudicialDto {
  id: number | string;
  nombre?: string;
  nombreCorto?: string;
  codigoSigla?: string;
  activo?: string | boolean;
}

export interface ListarMaestrosDescripcionResponse extends BaseResponse {
  data: MaestroDescripcionDto[];
}

export interface ObtenerMaestroDescripcionResponse extends BaseResponse {
  data: MaestroDescripcionDto | null;
}

export interface ObtenerCargoMagistradoResponse extends BaseResponse {
  data: CargoMagistradoDto | null;
}

export interface ListarColegiosProfesionalesResponse extends BaseResponse {
  data: ColegioProfesionalDto[];
}

export interface ListarDistritosJudicialesResponse extends BaseResponse {
  data: DistritoJudicialDto[];
}

export interface UniversidadDto {
  id: number | string;
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  paisId?: number | string;
  activo?: string | boolean;
}

export interface PaisDto {
  id: number | string;
  nombre?: string;
  descripcion?: string;
  activo?: string | boolean;
}

export interface ListarUniversidadesResponse extends BaseResponse {
  data: UniversidadDto[];
}

export interface ListarPaisesResponse extends BaseResponse {
  data: PaisDto[];
}
