/** Rutas públicas: el interceptor NO les adjunta el header Authorization. */
export const urlsGlobal = ['/autenticacion', 'api/authenticate'];

/** Endpoints de autenticación (relativos a `getAppConfig().urlApi`). */
export const authEndpoints = {
  TOKEN_BASICO: 'api/authenticate',
  LOGIN: 'authenticate/login',
  OPCIONES: 'authenticate/opciones',
  REFRESH: 'seguridad/refresh',
} as const;
