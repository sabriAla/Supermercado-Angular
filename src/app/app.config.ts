import { ApplicationConfig, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';

import { AppRoutingModule } from './app-routing.module';
import { authInterceptor } from './interceptores/auth.interceptor';

// Para que los precios salgan como $ 1.450 y las fechas en español
registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {

  providers: [

    importProvidersFrom(AppRoutingModule),

    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    { provide: LOCALE_ID, useValue: 'es-AR' }

  ]

};