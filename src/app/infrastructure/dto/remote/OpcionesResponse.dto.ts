import { BaseResponse } from './BaseResponse,dto';

export interface OpcionSistema {
  id: number;
  title: string;
  description: string;
  select: boolean;
  activate: boolean;
  icon: string;
  url: string; // si es padre # y si es hijo, la ruta completa /padre/hijo/subhijo
  hijos: OpcionSistema[];
}

export interface MenuOpcionesSistema {
  opciones: OpcionSistema[];
}

export interface MenuOpcion {
  id: number;
  url: string;
  nombre: string;
  icono: string;
  activo: string | null;
  idOpcionSuperior: number | null;
}

export interface OpcionesData {
  opciones: MenuOpcion[];
  token: string;
  rol: string;
}
export interface OpcionesResponse extends BaseResponse {
  data: OpcionesData;
}
