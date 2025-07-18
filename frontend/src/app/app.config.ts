import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideClientHydration} from '@angular/platform-browser';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {routes} from './app.routes';
import {csrfInterceptor} from './csrf.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({eventCoalescing: true}),
        provideRouter(routes),
        provideClientHydration(),
        provideHttpClient(withInterceptors([csrfInterceptor])),
        provideAnimations(),
    ],
};
