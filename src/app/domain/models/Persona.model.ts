import { AuditoriaRequest } from '../../infrastructure/dto/remote/AuditoriaRequest.dto';

export interface PersonaModel {
  id?: number | undefined | null;
  idTipoDocumento: string;
  tipoDocumento?: string | undefined | null;
  numeroDocumento: string;
  fechaNacimiento: string;
  sexo: string;
  primerApellido: string;
  segundoApellido: string;
  nombres: string;
  telefono: string;
  correo: string;
  activo?: string | undefined | null;
  auditoria?: AuditoriaRequest;

}
