/**
 * Configuración de runtime (por ambiente).
 * Ops cambia `assets/config.json` en el servidor sin regenerar el build.
 */
export interface AppRuntimeConfig {
  urlApi: string;
  tokenCaptcha: string;
  codigoCliente: string;
  codigoRol: string;
  usuarioConsumo: string;
  claveUsuarioConsumo: string;
  idGoogleAnalitics: string;
  linkInterno: string;
  linkExterno: string;
  encrypPassword: string;
  encryptSalt: string;
  documentosInstitucionales: {
    maxTamanoBytes: number;
    mimePermitido: string;
    latenciaMockMs?: number;
  };
}
