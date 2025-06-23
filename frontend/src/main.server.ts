import 'zone.js/node';
import {provideServerRendering} from '@angular/platform-server';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideHttpClient} from '@angular/common/http';
import {provideZoneChangeDetection} from '@angular/core';
import {routes} from './app/app.routes';
import {provideRouter} from '@angular/router';
import {provideAnimations} from '@angular/platform-browser/animations';

export default function bootstrap() {
	return bootstrapApplication(AppComponent, {
		providers: [
			provideServerRendering(),
			provideHttpClient(),
			provideRouter(routes),
			provideZoneChangeDetection({eventCoalescing: true}),
            provideAnimations()
		]
	});
}
