import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration} from '@angular/platform-browser';
import {HttpInterceptorFn, provideHttpClient, withInterceptors, withXsrfConfiguration} from "@angular/common/http";
import {provideAnimations} from '@angular/platform-browser/animations';

export const logCsrfInterceptor: HttpInterceptorFn = (req, next) => {
    const token = req.headers.get('X-XSRF-TOKEN');
    console.log('Outgoing CSRF Token Header:', token);
    return next(req);
};

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({eventCoalescing: true}),
		provideRouter(routes),
		provideClientHydration(),
        provideHttpClient(
            withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
            withInterceptors([logCsrfInterceptor])
        ),
        provideAnimations()
	]
};
