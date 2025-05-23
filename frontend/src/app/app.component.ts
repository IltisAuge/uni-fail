import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HttpService} from './http.service';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet],
	templateUrl: './app.component.html',
	standalone: true,
	styleUrl: './app.component.css'
})
export class AppComponent {
	title = 'frontend';
	apiResponse: any = 'Requesting API response...';

	constructor(private httpService: HttpService) {
		httpService.load("/").subscribe(r => this.apiResponse = r);
	}
}
