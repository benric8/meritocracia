import { BaseResponse } from './BaseResponse,dto';

/** Respuesta de GET /fichas/flujo. */
export type FlujoFichaApi =
  | 'NUEVA'
  | 'NUEVA_CON_DATA_PREVIA'
  | 'EDITABLE'
  | 'NO_EDITABLE'
  | 'ASIGNADO_A_OTRO';

export interface FlujoFichaDto {
  flujo: FlujoFichaApi | string;
  idMagistrado: number | null;
  idFicha: number | null;
  idFichaPrevia: number | null;
  completado: string | null;
}

export interface FlujoFichaResponse extends BaseResponse {
  data: FlujoFichaDto;
}

export interface DatosPersonalesJuezRequestDto {
  dni: string;
  nombreCompleto: string;
  foto: string;
  fechaNacimiento: string;
  sexo: string;
}

export interface CrearFichaRequestDto {
  cargoMagistradoId: number;
  fechaValoracionId: number;
  importarDesdeFichaId: number | null;
  usuarioRegistradorId: number;
  datosPersonalesJuez: DatosPersonalesJuezRequestDto;
}

export interface CrearFichaDataDto {
  idFicha: number;
  idMagistrado: number;
  idFechaValoracion: number;
  idCargoMagistrado: number;
  idRegistradorPrincipal: number;
  completado: string;
  edad: number;
}

export interface CrearFichaResponse extends BaseResponse {
  data: CrearFichaDataDto;
}

/** Body de PUT /fichas/{idFicha}. El DNI y la fecha de valoración no se envían. */
export interface ActualizarFichaDatosPersonalesJuezRequestDto {
  nombreCompleto: string;
  /** Opcional: si no se envía, el backend conserva la foto actual. */
  foto?: string;
  fechaNacimiento: string;
  sexo: string;
}

export interface ActualizarFichaRequestDto {
  cargoMagistradoId: number;
  usuarioRegistradorId: number;
  datosPersonalesJuez: ActualizarFichaDatosPersonalesJuezRequestDto;
}

export interface ActualizarFichaDataDto {
  idFicha: number;
  idMagistrado: number;
  idFechaValoracion: number;
  idCargoMagistrado: number;
  idRegistradorPrincipal: number;
  puntaje: number;
  completado: string;
  edad: number;
}

export interface ActualizarFichaResponse extends BaseResponse {
  data: ActualizarFichaDataDto;
}

/** Respuesta de GET /fichas/{idFicha}?registrador_id=. */
export interface MagistradoFichaDto {
  idMagistrado: number;
  dni: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  sexo: string;
  /** JPG en Base64 sin prefijo `data:`; `null` si no hay foto o no se pudo obtener. */
  fotoBase64: string | null;
}

export interface RegistradoresFichaDto {
  principal: number | null;
  secundario: number | null;
}

export interface RubroResumenFichaDto {
  idRubro: number;
  codigo: string;
  nombre: string;
  puntajeSubtotal: number;
  cantidadItems: number;
  tieneDetalle: boolean;
}

export interface ObtenerFichaDataDto {
  idFicha: number;
  idFechaValoracion: number;
  fechaValoracion: string;
  idCargoMagistrado: number;
  cargoDescripcion: string;
  puntajeTotal: number;
  edad: number;
  completado: string;
  flujo: string;
  magistrado: MagistradoFichaDto;
  registradores: RegistradoresFichaDto;
  rubros: RubroResumenFichaDto[];
}

export interface ObtenerFichaResponse extends BaseResponse {
  data: ObtenerFichaDataDto;
}
