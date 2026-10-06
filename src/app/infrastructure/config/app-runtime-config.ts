import { AppRuntimeConfig } from './app-runtime-config.model';

/** Valores por defecto (desarrollo). Producción debe sobreescribir vía `assets/config.json`. */
export const APP_CONFIG_DEFAULTS: AppRuntimeConfig = {
  urlApi: 'http://172.19.9.35:8080/meritocracia-api-rest/',
  tokenCaptcha: '6LeqbAAnAAAAAIfjfpyKd8J1k5tHZa6uFClrLmxm',
  codigoCliente: 'CLST1',
  codigoRol: 'QXeK+ABfEEKtz1FzgAPBGg==',
  usuarioConsumo: 'kNeeHs/iT/J5k0yu8iUrxw==',
  claveUsuarioConsumo: 'ndAUiY58oUA=',
  idGoogleAnalitics: 'UA-93917304-1',
  linkInterno:
    'https://www.pj.gob.pe/wps/wcm/connect/ac17260042132105b4c3bc5aa55ef1d3/Organigrama+Estructural+del+Poder+Judicial+al+25+de+marzo+de+2021.pdf?MOD=AJPERES',
  linkExterno:
    'www.pj.gob.pe/wps/wcm/connect/ac17260042132105b4c3bc5aa55ef1d3/Organigrama+Estructural+del+Poder+Judicial+al+25+de+marzo+de+2021.pdf?MOD=AJPERES',
  encrypPassword: 'bqR2KdGgcr4YAemywPlHQu0H4Vh3tg77',
  encryptSalt: 'GPMG6hX6MhgYXT8qcrCAiylPg0LTcOFN',
  documentosInstitucionales: {
    maxTamanoBytes: 5 * 1024 * 1024,
    mimePermitido: 'application/pdf',
    latenciaMockMs: 450,
  },
};

let configActual: AppRuntimeConfig = structuredClone(APP_CONFIG_DEFAULTS);

export function getAppConfig(): AppRuntimeConfig {
  return configActual;
}

export function setAppConfig(parcial: Partial<AppRuntimeConfig>): void {
  configActual = {
    ...APP_CONFIG_DEFAULTS,
    ...parcial,
    documentosInstitucionales: {
      ...APP_CONFIG_DEFAULTS.documentosInstitucionales,
      ...parcial.documentosInstitucionales,
    },
  };
}

/** Restablece defaults (útil en tests). */
export function resetAppConfig(): void {
  configActual = structuredClone(APP_CONFIG_DEFAULTS);
}
