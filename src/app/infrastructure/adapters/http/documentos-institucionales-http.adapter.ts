import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { constantes, tokenNiveles } from '../../../domain/commons/constants';
import {
  DocumentoInstitucional,
  SubirDocumentoPeticion,
} from '../../../domain/models/documento-institucional.model';
import { PeticionPaginada, ResultadoPaginado } from '../../../domain/models/paginacion.model';
import { DocumentosInstitucionalesPort } from '../../../domain/ports/documentos-institucionales.port';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { crearParametrosPaginacion } from '../../api/paginacion-http.util';
import { documentosInstitucionalesEndpoints } from '../../api/inicio-api.constants';
import {
  DocumentoInstitucionalResponse,
  ListarDocumentosInstitucionalesResponse,
} from '../../dto/remote/DocumentoInstitucionalResponse.dto';
import { toDocumentoInstitucional } from '../../mappers/documentos-institucional.mapper';
import { toResultadoPaginado } from '../../mappers/paginacion.mapper';
import { crearFormDataDocumento } from './documentos-form-data.util';

@Injectable({ providedIn: 'root' })
export class DocumentosInstitucionalesHttpAdapter implements DocumentosInstitucionalesPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);
  private readonly baseUrl = environment.urlApi;

  listar(peticion: PeticionPaginada): Observable<ResultadoPaginado<DocumentoInstitucional>> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarDocumentosInstitucionalesResponse>(
        `${this.baseUrl}${documentosInstitucionalesEndpoints.LISTAR}`,
        { params: crearParametrosPaginacion(peticion) }
      )
      .pipe(
        map((respuesta) => {
          this.validarExito(respuesta);
          return toResultadoPaginado(respuesta, toDocumentoInstitucional);
        })
      );
  }

  subir(peticion: SubirDocumentoPeticion, _usuario: string): Observable<DocumentoInstitucional> {
    return this.enviarDocumento(documentosInstitucionalesEndpoints.SUBIR, peticion);
  }

  reemplazar(
    id: string,
    peticion: SubirDocumentoPeticion,
    _usuario: string
  ): Observable<DocumentoInstitucional> {
    return this.enviarDocumento(documentosInstitucionalesEndpoints.REEMPLAZAR(id), peticion, 'PUT');
  }

  descargar(id: string): Observable<Blob> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http.get(`${this.baseUrl}${documentosInstitucionalesEndpoints.DESCARGAR(id)}`, {
      responseType: 'blob',
    });
  }

  private enviarDocumento(
    endpoint: string,
    peticion: SubirDocumentoPeticion,
    metodo: 'POST' | 'PUT' = 'POST'
  ): Observable<DocumentoInstitucional> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const url = `${this.baseUrl}${endpoint}`;
    const cuerpo = crearFormDataDocumento(peticion);
    const peticionHttp =
      metodo === 'PUT'
        ? this.http.put<DocumentoInstitucionalResponse>(url, cuerpo)
        : this.http.post<DocumentoInstitucionalResponse>(url, cuerpo);

    return peticionHttp.pipe(
      map((respuesta) => {
        this.validarExito(respuesta);
        return toDocumentoInstitucional(respuesta.data);
      })
    );
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error('Se requiere una sesión con perfil cargado para gestionar documentos.');
    }
  }

  private validarExito(respuesta: { codigo: string; descripcion: string }): void {
    if (respuesta.codigo !== constantes.RES_COD_EXITO) {
      throw new Error(respuesta.descripcion || 'La operación fue rechazada por el servidor.');
    }
  }
}
