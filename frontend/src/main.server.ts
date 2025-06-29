import 'zone.js/node';
import {provideServerRendering} from '@angular/platform-server';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideHttpClient, withXsrfConfiguration} from '@angular/common/http';
import {provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideAnimations} from '@angular/platform-browser/animations';
import {routes} from './app/app.routes';
import {AppComponent} from './app/app.component';

export default function bootstrap() {
    return bootstrapApplication(AppComponent, {
        providers: [
            provideServerRendering(),
            provideHttpClient(withXsrfConfiguration({
                cookieName: 'XSRF-TOKEN',
                headerName: 'X-XSRF-TOKEN',
                crossOrigin: true,
            } as any)),
            provideRouter(routes),
            provideZoneChangeDetection({eventCoalescing: true}),
            provideAnimations(),
        ],
    });
}
