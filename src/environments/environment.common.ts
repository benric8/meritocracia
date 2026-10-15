import { AppEnvironment } from './environment.model';

/** Valores compartidos. Cada ambiente solo redefine `production` y `urlApi`. */
export const environmentCommon: Omit<AppEnvironment, 'production' | 'urlApi'> = {
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
  },
};
