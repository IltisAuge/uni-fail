import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpService} from '../http.service';
import {environment} from '../../environments/environment';
import {TitleService} from '../title.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		FormsModule
	],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css'
})
export class LoginComponent {

	constructor(private http: HttpService,
                private titleService: TitleService) {
        this.titleService.setTitle('Anmelden');
	}

	openLoginPage(provider: string) {
		window.location.href = environment.apiBaseUrl + '/login?provider=' + provider;
	}
}
