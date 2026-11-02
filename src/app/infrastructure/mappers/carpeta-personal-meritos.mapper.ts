import {
  CarpetaPersonalMeritos,
  SeccionCarpetaMeritos,
  TablaCarpetaMeritos,
} from '../../domain/models/carpeta-personal-meritos.model';
import {
  CarpetaPersonalMeritosDto,
  SeccionCarpetaMeritosDto,
  TablaCarpetaMeritosDto,
} from '../dto/remote/CarpetaPersonalMeritosResponse.dto';

/** Lo que muestra una celda sin dato (igual que el PDF). */
const SIN_DATO = '—';

export function toCarpetaPersonalMeritos(
  dto: CarpetaPersonalMeritosDto | null | undefined
): CarpetaPersonalMeritos {
  return {
    idFicha: dto?.idFicha == null ? '' : String(dto.idFicha),
    fechaValoracion: dto?.fechaValoracion ?? '',
    fotoBase64: aTextoOpcional(dto?.fotoBase64),
    dni: dto?.dni ?? '',
    apellidosNombres: dto?.apellidosNombres ?? '',
    sexo: aTextoOpcional(dto?.sexo),
    estadoCivil: aTextoOpcional(dto?.estadoCivil),
    fechaNacimiento: dto?.fechaNacimiento ?? null,
    edad: dto?.edad ?? null,
    distritoJudicial: aTextoOpcional(dto?.distritoJudicial),
    despachoJudicial: aTextoOpcional(dto?.despachoJudicial),
    cargo: aTextoOpcional(dto?.cargo),
    condicion: aTextoOpcional(dto?.condicion),
    primeraEspecialidad: aTextoOpcional(dto?.primeraEspecialidad),
    segundaEspecialidad: aTextoOpcional(dto?.segundaEspecialidad),
    anexoTelefonico: aTextoOpcional(dto?.anexoTelefonico),
    correoInstitucional: aTextoOpcional(dto?.correoInstitucional),
    secciones: (dto?.secciones ?? []).map(toSeccion),
  };
}

function toSeccion(dto: SeccionCarpetaMeritosDto): SeccionCarpetaMeritos {
  return {
    numero: dto.numero ?? '',
    titulo: dto.titulo ?? '',
    nota: aTextoOpcional(dto.nota),
    tablas: (dto.tablas ?? []).map(toTabla),
  };
}

function toTabla(dto: TablaCarpetaMeritosDto): TablaCarpetaMeritos {
  const columnas = dto.columnas ?? [];
  // Un peso faltante o inválido reparte el ancho en partes iguales.
  const anchos = columnas.map((_, i) => {
    const peso = dto.anchos?.[i];
    return typeof peso === 'number' && peso > 0 ? peso : 1;
  });
  return {
    titulo: aTextoOpcional(dto.titulo),
    columnas,
    anchos,
    // Cada fila con tantas celdas como columnas; las vacías se ven como en el PDF.
    filas: (dto.filas ?? []).map((fila) =>
      columnas.map((_, i) => aTextoOpcional(fila?.[i]) ?? SIN_DATO)
    ),
  };
}

function aTextoOpcional(valor: string | null | undefined): string | null {
  return valor?.trim() || null;
}
