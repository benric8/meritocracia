import { HttpContextToken } from '@angular/common/http';

/** Evita el modal global de error para peticiones que gestionan el fallo en pantalla. */
export const OMITIR_MODAL_ERROR_API = new HttpContextToken<boolean>(() => false);
