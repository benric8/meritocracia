import { environmentCommon } from './environment.common';
import { AppEnvironment } from './environment.model';

/** Build de producción: `ng build` o `ng build --configuration=production`. */
export const environment: AppEnvironment = {
  ...environmentCommon,
  production: true,
  urlApi: 'https://HOST-PRODUCCION/meritocracia-api-rest/',
};
