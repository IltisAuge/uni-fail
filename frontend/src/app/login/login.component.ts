import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpService} from '../http.service';

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

	constructor(private http: HttpService) {
	}

	openLoginPage(provider: string) {
		window.location.href = `/login?provider=${provider}`;
	}
}
