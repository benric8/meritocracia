/** Valores inyectados en compile-time según la configuración de build. */
export interface AppEnvironment {
  production: boolean;
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
  };
}
