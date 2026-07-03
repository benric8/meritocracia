import { Util } from '../app/domain/commons/util';
export const environment = {
  production: true,
  urlApi: Util.v1,
  tokenCaptcha: Util.v2,
  codigoCliente: Util.v3,
  codigoRol: Util.v4,
  usuarioConsumo: Util.v5,
  claveUsuarioConsumo: Util.v6,
  idGoogleAnalitics: Util.v7,
  linkInterno: Util.v8,
  linkExterno: Util.v9,
  encrypPassword:"bqR2KdGgcr4YAemywPlHQu0H4Vh3tg77",
    encryptSalt:"GPMG6hX6MhgYXT8qcrCAiylPg0LTcOFN",
  documentosInstitucionales: {
    maxTamanoBytes: 5 * 1024 * 1024,
    mimePermitido: 'application/pdf',
  },
};
