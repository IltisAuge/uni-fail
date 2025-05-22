import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet],
	templateUrl: './app.component.html',
	standalone: true,
	styleUrl: './app.component.css'
})
export class AppComponent {
	title = 'frontend';
	apiResponse: string = 'Requesting API response...';

	constructor(private http: HttpClient) {
		http.get(environment.apiBaseUrl + '/', {responseType: 'text'}).subscribe(data => {
			this.apiResponse = data;
		})
	}
}
