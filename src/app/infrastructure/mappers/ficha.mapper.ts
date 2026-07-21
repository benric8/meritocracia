import {
  CrearBorradorFicha,
  crearRubroAntiguedadVacio,
  crearRubroGradosTitulosVacio,
  FichaValoracion,
  ResultadoResolverFicha,
} from '../../domain/models/ficha-valoracion.model';
import { getAppConfig } from '../config/app-runtime-config';
import {
  CrearFichaDataDto,
  CrearFichaRequestDto,
  FlujoFichaDto,
  ObtenerFichaDataDto,
} from '../dto/remote/FichaResponse.dto';
import { normalizarFotoSiga } from './juez.mapper';

/**
 * El dominio puede guardar data URL para `<img>`; el API exige solo el base64.
 */
export function aFotoBase64Pura(valor: string | null | undefined): string {
  const foto = String(valor ?? '')
    .replace(/\s/g, '')
    .trim();
  if (!foto) {
    return '';
  }

  const dataUrl = /^data:[^;]+;base64,/i.exec(foto);
  if (dataUrl) {
    return foto.slice(dataUrl[0].length);
  }

  return foto;
}

export function toResultadoResolverFicha(dto: FlujoFichaDto): ResultadoResolverFicha {
  const flujo = String(dto.flujo ?? '')
    .trim()
    .toUpperCase();
  const magistradoId =
    dto.idMagistrado != null ? String(dto.idMagistrado) : undefined;

  switch (flujo) {
    case 'NUEVA':
      return { tipo: 'NUEVA' };

    case 'NUEVA_CON_DATA_PREVIA': {
      if (dto.idFichaPrevia == null) {
        throw new Error('Flujo NUEVA_CON_DATA_PREVIA sin idFichaPrevia');
      }
      return {
        tipo: 'NUEVA_CON_PREVIA',
        fichaPreviaId: String(dto.idFichaPrevia),
        magistradoId,
      };
    }

    case 'EDITABLE': {
      if (dto.idFicha == null) {
        throw new Error('Flujo EDITABLE sin idFicha');
      }
      return { tipo: 'EDITABLE', fichaId: String(dto.idFicha), magistradoId };
    }

    case 'NO_EDITABLE': {
      if (dto.idFicha == null) {
        throw new Error('Flujo NO_EDITABLE sin idFicha');
      }
      return { tipo: 'BLOQUEADA', fichaId: String(dto.idFicha), magistradoId };
    }

    case 'ASIGNADO_A_OTRO': {
      if (dto.idFicha == null) {
        throw new Error('Flujo ASIGNADO_A_OTRO sin idFicha');
      }
      return {
        tipo: 'ASIGNADO_A_OTRO',
        fichaId: String(dto.idFicha),
        magistradoId,
      };
    }

    default:
      throw new Error(`Flujo de ficha no reconocido: ${dto.flujo}`);
  }
}

export function toCrearFichaRequestDto(
  peticion: CrearBorradorFicha,
  usuarioRegistradorId: number
): CrearFichaRequestDto {
  const cargoMagistradoId = Number(peticion.nivelId);
  const fechaValoracionId = Number(peticion.fechaValoracionId);
  const importarDesde = peticion.arrastrarDesdeFichaId?.trim()
    ? Number(peticion.arrastrarDesdeFichaId)
    : null;

  if (!Number.isFinite(cargoMagistradoId) || cargoMagistradoId <= 0) {
    throw new Error('Cargo de magistrado no válido.');
  }
  if (!Number.isFinite(fechaValoracionId) || fechaValoracionId <= 0) {
    throw new Error('Fecha de valoración no válida.');
  }
  if (importarDesde != null && (!Number.isFinite(importarDesde) || importarDesde <= 0)) {
    throw new Error('Ficha previa a importar no válida.');
  }

  const dp = peticion.datosPersonales;

  return {
    cargoMagistradoId,
    fechaValoracionId,
    importarDesdeFichaId: importarDesde,
    usuarioRegistradorId,
    datosPersonalesJuez: {
      dni: dp.dni.trim(),
      nombreCompleto: dp.nombreCompleto.trim(),
      foto: aFotoBase64Pura(dp.foto),
      fechaNacimiento: dp.fechaNacimiento.trim(),
      sexo: dp.sexo,
    },
  };
}

export function toFichaValoracionDesdeCreacion(
  data: CrearFichaDataDto,
  peticion: CrearBorradorFicha
): FichaValoracion {
  const ahora = new Date().toISOString();
  const completado = String(data.completado ?? '0').trim();

  return {
    id: String(data.idFicha),
    estado: completado === '1' ? 'REGISTRADA' : 'BORRADOR',
    nivelId: String(data.idCargoMagistrado ?? peticion.nivelId),
    nivelNombre: peticion.nivelNombre.trim(),
    fechaValoracionId: String(data.idFechaValoracion ?? peticion.fechaValoracionId),
    fechaValoracionSnapshot: peticion.fechaValoracionSnapshot.trim().slice(0, 10),
    datosPersonales: {
      dni: peticion.datosPersonales.dni.trim(),
      nombreCompleto: peticion.datosPersonales.nombreCompleto.trim(),
      foto: peticion.datosPersonales.foto ?? '',
      fechaNacimiento: peticion.datosPersonales.fechaNacimiento.trim(),
      sexo: peticion.datosPersonales.sexo,
      edad: data.edad ?? peticion.datosPersonales.edad,
    },
    fichaPreviaId: peticion.arrastrarDesdeFichaId?.trim() || null,
    rubroAntiguedad: crearRubroAntiguedadVacio(),
    rubroGradosTitulos: crearRubroGradosTitulosVacio(),
    puntajeTotal: 0,
    creadoEn: ahora,
    actualizadoEn: ahora,
  };
}

/**
 * Resuelve foto de ficha: URL absoluta, ruta `/upload/...` (origen de urlApi) o base64.
 */
export function resolverUrlFotoFicha(valor: string | null | undefined): string {
  const foto = String(valor ?? '').trim();
  if (!foto) {
    return '';
  }

  if (
    foto.startsWith('data:') ||
    foto.startsWith('http://') ||
    foto.startsWith('https://') ||
    foto.startsWith('blob:')
  ) {
    return foto;
  }

  // JPEG base64 suele empezar con `/9j/`; no confundir con rutas de archivo.
  if (foto.startsWith('/') && !foto.startsWith('/9j/')) {
    try {
      const origen = new URL(getAppConfig().urlApi).origin;
      return `${origen}${foto}`;
    } catch {
      return foto;
    }
  }

  return normalizarFotoSiga(foto);
}

export function toFichaValoracionDesdeDetalle(data: ObtenerFichaDataDto): FichaValoracion {
  const ahora = new Date().toISOString();
  const completado = String(data.completado ?? '0').trim();
  const magistrado = data.magistrado;
  const sexoRaw = String(magistrado?.sexo ?? '')
    .trim()
    .toUpperCase();
  const sexo = sexoRaw === 'F' ? 'F' : 'M';
  const puntaje = Number(data.puntajeTotal);
  const edad = data.edad != null ? Number(data.edad) : null;

  return {
    id: String(data.idFicha),
    estado: completado === '1' ? 'REGISTRADA' : 'BORRADOR',
    nivelId: String(data.idCargoMagistrado),
    nivelNombre: String(data.cargoDescripcion ?? '').trim(),
    fechaValoracionId: String(data.idFechaValoracion),
    fechaValoracionSnapshot: String(data.fechaValoracion ?? '')
      .trim()
      .slice(0, 10),
    datosPersonales: {
      dni: String(magistrado?.dni ?? '').trim(),
      nombreCompleto: String(magistrado?.nombreCompleto ?? '').trim(),
      foto: resolverUrlFotoFicha(magistrado?.foto),
      fechaNacimiento: String(magistrado?.fechaNacimiento ?? '')
        .trim()
        .slice(0, 10),
      sexo,
      edad: edad != null && Number.isFinite(edad) ? edad : null,
    },
    fichaPreviaId: null,
    rubroAntiguedad: crearRubroAntiguedadVacio(),
    rubroGradosTitulos: crearRubroGradosTitulosVacio(),
    puntajeTotal: Number.isFinite(puntaje) ? puntaje : 0,
    creadoEn: ahora,
    actualizadoEn: ahora,
  };
}
