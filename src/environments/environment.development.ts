import { environmentCommon } from './environment.common';
import { AppEnvironment } from './environment.model';

/** Build local: `ng serve` y `ng build --configuration=development`. */
export const environment: AppEnvironment = {
  ...environmentCommon,
  production: false,
  urlApi: 'http://localhost:8083/meritocracia-api-rest/',
};
