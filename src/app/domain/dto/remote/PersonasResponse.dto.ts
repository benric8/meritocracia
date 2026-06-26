import { PersonaModel } from '../../models/Persona.model';
import { BaseResponse } from './BaseResponse,dto';

export interface ListarPersonasResponse extends BaseResponse {
  data: PersonaModel[];
}
