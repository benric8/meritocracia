import { SesionPort } from '../domain/ports/sesion.port';

/** Mock mínimo de SesionPort para pruebas unitarias. */
export function crearSesionPortMock(): SesionPort {
  return {
    getToken: () => null,
    setToken: () => undefined,
    getTokenNivel: () => null,
    setTokenNivel: () => undefined,
    setTiemposToken: () => undefined,
    marcarTokenGenerado: () => undefined,
    getSegundosDesdeGeneracion: () => -1,
    getExpsSeg: () => -1,
    getRefsSeg: () => -1,
    isTokenVigente: () => false,
    isVentanaRefreshVigente: () => false,
    getUsuarioCodigo: () => null,
    setUsuarioCodigo: () => undefined,
    getNombreCompleto: () => null,
    setNombreCompleto: () => undefined,
    getPerfilAlmacenado: () => null,
    setPerfilAlmacenado: () => undefined,
    getOpciones: () => [],
    setOpciones: () => undefined,
    limpiarSesion: () => undefined,
  };
}
