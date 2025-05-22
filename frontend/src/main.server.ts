import 'zone.js/node';
import {provideServerRendering} from '@angular/platform-server';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideHttpClient} from '@angular/common/http';
import {provideZoneChangeDetection} from '@angular/core';

export default function bootstrap() {
	return bootstrapApplication(AppComponent, {
		providers: [
			provideServerRendering(),
			provideHttpClient(),
			provideZoneChangeDetection({eventCoalescing: true})
		]
	});
}
