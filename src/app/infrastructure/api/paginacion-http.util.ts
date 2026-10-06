import { HttpParams } from '@angular/common/http';
import { PeticionPaginada } from '../../domain/models/paginacion.model';

export function crearParametrosPaginacion(peticion: PeticionPaginada): HttpParams {
  return new HttpParams()
    .set('pagina', String(peticion.pagina))
    .set('tamanio', String(peticion.tamanio));
}
