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
import { BaseResponse } from '../../dto/remote/BaseResponse,dto';
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
          const resultado = toResultadoPaginado(respuesta, (dto) => dto);
          return {
            ...resultado,
            elementos: (respuesta.data ?? [])
              .map((dto) => {
                try {
                  return toUsuarioGestion(dto);
                } catch {
                  return null;
                }
              })
              .filter((usuario): usuario is UsuarioGestion => usuario !== null),
          };
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

  resetearClave(id: string): Observable<void> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .put<BaseResponse>(`${this.baseUrl}${usuariosEndpoints.RESETEAR_CLAVE(id)}`, null)
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
        })
      );
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error('Se requiere una sesión con perfil cargado para gestionar usuarios.');
    }
  }
}
