import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { tokenNiveles } from '../../../domain/commons/constants';
import { PeticionPaginada, ResultadoPaginado } from '../../../domain/models/paginacion.model';
import { NuevoUsuarioGestion, UsuarioGestion } from '../../../domain/models/usuario-gestion.model';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { UsuariosPort } from '../../../domain/ports/usuarios.port';
import { assertRespuestaExitosa } from '../../api/api-response.util';
import { crearParametrosPaginacion } from '../../api/paginacion-http.util';
import { usuariosEndpoints } from '../../api/usuarios-api.constants';
import {
  ListarUsuariosResponse,
  RegistrarUsuarioResponse,
} from '../../dto/remote/RegistrarUsuarioResponse.dto';
import { toResultadoPaginado } from '../../mappers/paginacion.mapper';
import {
  toRegistrarUsuarioRequestDto,
  toUsuarioGestion,
} from '../../mappers/usuario-gestion.mapper';

@Injectable({ providedIn: 'root' })
export class UsuariosHttpAdapter implements UsuariosPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);
  private readonly baseUrl = environment.urlApi;

  listar(peticion: PeticionPaginada): Observable<ResultadoPaginado<UsuarioGestion>> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarUsuariosResponse>(`${this.baseUrl}${usuariosEndpoints.LISTAR}`, {
        params: crearParametrosPaginacion(peticion),
      })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return toResultadoPaginado(respuesta, toUsuarioGestion);
        })
      );
  }

  registrar(peticion: NuevoUsuarioGestion): Observable<UsuarioGestion> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const body = toRegistrarUsuarioRequestDto(peticion);

    return this.http
      .post<RegistrarUsuarioResponse>(`${this.baseUrl}${usuariosEndpoints.REGISTRAR}`, body)
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return toUsuarioGestion(respuesta.data);
        })
      );
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error('Se requiere una sesión con perfil cargado para gestionar usuarios.');
    }
  }
}
