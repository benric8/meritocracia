import { ApplicationConfig, inject, LOCALE_ID, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { routes } from './app.routes';
import { DOCUMENTOS_INSTITUCIONALES_PORT } from './domain/ports/documentos-institucionales.port';
import { DocumentosInstitucionalesHttpAdapter } from './infrastructure/adapters/http/documentos-institucionales-http.adapter';
import { AUTENTICACION_PORT } from './domain/ports/autenticacion.port';
import { SESION_PORT } from './domain/ports/sesion.port';
import { AutenticacionHttpAdapter } from './infrastructure/adapters/http/autenticacion-http.adapter';
import { SessionStorageAdapter } from './infrastructure/adapters/storage/session-storage.adapter';
import { PublicIpService } from './infrastructure/network/public-ip.service';
import { auditoriaInterceptor } from './infrastructure/security/interceptors/auditoria.interceptor';
import { sessionInterceptor } from './infrastructure/security/interceptors/session.interceptor';
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
    provideAppInitializer(precargarIpPublica),
    provideAppInitializer(prepararVigenciaSesion),
    provideHttpClient(withInterceptors([auditoriaInterceptor, sessionInterceptor])),
    { provide: SESION_PORT, useClass: SessionStorageAdapter },
    { provide: AUTENTICACION_PORT, useClass: AutenticacionHttpAdapter },
    { provide: DOCUMENTOS_INSTITUCIONALES_PORT, useClass: DocumentosInstitucionalesHttpAdapter },
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlEs },
  ]
};
