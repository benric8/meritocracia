import { environmentCommon } from './environment.common';
import { AppEnvironment } from './environment.model';

/** Build de pruebas: `ng build --configuration=qa`. */
export const environment: AppEnvironment = {
  ...environmentCommon,
  production: false,
  urlApi: 'http://172.19.9.35:8080/meritocracia-api-rest/',
};
