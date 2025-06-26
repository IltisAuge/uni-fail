import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {environment} from '../../environments/environment';
import {TitleService} from '../services/title.service';

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

	constructor(private titleService: TitleService) {
        this.titleService.setTitle('Anmelden');
	}

	openLoginPage(provider: string) {
		window.location.href = `${environment.apiBaseUrl}/login?provider=${provider}`;
	}
}
