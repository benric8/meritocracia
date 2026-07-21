import { ApplicationConfig, inject, LOCALE_ID, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { OVERLAY_DEFAULT_CONFIG } from '@angular/cdk/overlay';
import { firstValueFrom } from 'rxjs';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { routes } from './app.routes';
import { ALERTAS_PORT } from './domain/ports/alertas.port';
import { DOCUMENTOS_INSTITUCIONALES_PORT } from './domain/ports/documentos-institucionales.port';
import { ANTIGUEDAD_PORT } from './domain/ports/antiguedad.port';
import { FECHA_VALORACION_PORT } from './domain/ports/fecha-valoracion.port';
import { FICHA_PORT } from './domain/ports/ficha.port';
import { JUEZ_PORT } from './domain/ports/juez.port';
import { MAESTROS_PORT } from './domain/ports/maestros.port';
import { USUARIOS_PORT } from './domain/ports/usuarios.port';
import { DocumentosInstitucionalesHttpAdapter } from './infrastructure/adapters/http/documentos-institucionales-http.adapter';
import { FechaValoracionHttpAdapter } from './infrastructure/adapters/http/fecha-valoracion-http.adapter';
import { FichaHttpGradosTitulosMockAdapter } from './infrastructure/adapters/mock/ficha-http-grados-titulos-mock.adapter';
import { MaestrosHttpGradosTitulosMockAdapter } from './infrastructure/adapters/mock/maestros-http-grados-titulos-mock.adapter';
import { UsuariosHttpAdapter } from './infrastructure/adapters/http/usuarios-http.adapter';
import { AntiguedadMockAdapter } from './infrastructure/adapters/mock/antiguedad-mock.adapter';
import { JuezSigaHttpEdadMockAdapter } from './infrastructure/adapters/mock/juez-siga-http-edad-mock.adapter';
import { AlertasSweetAlertAdapter } from './infrastructure/adapters/ui/alertas-sweetalert.adapter';
import { AUTENTICACION_PORT } from './domain/ports/autenticacion.port';
import { SESION_PORT } from './domain/ports/sesion.port';
import { AutenticacionHttpAdapter } from './infrastructure/adapters/http/autenticacion-http.adapter';
import { SessionStorageAdapter } from './infrastructure/adapters/storage/session-storage.adapter';
import { cargarAppConfig } from './infrastructure/config/cargar-app-config';
import { PublicIpService } from './infrastructure/network/public-ip.service';
import { auditoriaInterceptor } from './infrastructure/security/interceptors/auditoria.interceptor';
import { sessionInterceptor } from './infrastructure/security/interceptors/session.interceptor';
import { apiErrorInterceptor } from './infrastructure/security/interceptors/api-error.interceptor';
import { prepararVigenciaSesion } from './infrastructure/security/session/session-app.initializer';
import { MatPaginatorIntlEs } from './shared/material/mat-paginator-intl.es';

registerLocaleData(localeEs);

function precargarIpPublica(): Promise<string> {
  const publicIp = inject(PublicIpService);
  return firstValueFrom(publicIp.obtenerIpPublica());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Primero la config runtime; el resto puede depender de urlApi / claves.
    provideAppInitializer(cargarAppConfig),
    provideAppInitializer(precargarIpPublica),
    provideAppInitializer(prepararVigenciaSesion),
    provideHttpClient(withInterceptors([auditoriaInterceptor, sessionInterceptor, apiErrorInterceptor])),
    // Angular 21 pone MatDialog en top layer (Popover API); SweetAlert no puede competir con z-index.
    { provide: OVERLAY_DEFAULT_CONFIG, useValue: { usePopover: false } },
    { provide: SESION_PORT, useClass: SessionStorageAdapter },
    { provide: AUTENTICACION_PORT, useClass: AutenticacionHttpAdapter },
    { provide: DOCUMENTOS_INSTITUCIONALES_PORT, useClass: DocumentosInstitucionalesHttpAdapter },
    { provide: USUARIOS_PORT, useClass: UsuariosHttpAdapter },
    { provide: FECHA_VALORACION_PORT, useClass: FechaValoracionHttpAdapter },
    { provide: MAESTROS_PORT, useClass: MaestrosHttpGradosTitulosMockAdapter },
    { provide: FICHA_PORT, useClass: FichaHttpGradosTitulosMockAdapter },
    // Mocks / híbridos hasta disponer del API completo; sustituir por *HttpAdapter.
    // Rubros C y D: `MaestrosHttpGradosTitulosMockAdapter` + `FichaHttpGradosTitulosMockAdapter`.
    // SIGA real (GET jueces/siga); edad aún mock.
    { provide: JUEZ_PORT, useClass: JuezSigaHttpEdadMockAdapter },
    { provide: ANTIGUEDAD_PORT, useClass: AntiguedadMockAdapter },
    { provide: ALERTAS_PORT, useClass: AlertasSweetAlertAdapter },
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlEs },
  ]
};
