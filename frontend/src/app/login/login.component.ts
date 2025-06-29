import {Component, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {TitleService} from '../services/title.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormsModule,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent {

    previousUrl: string = '/';

    constructor(private titleService: TitleService,
                private router: Router) {
        this.titleService.setTitle('Anmelden');
        this.previousUrl = this.router.getCurrentNavigation()?.extras.state?.['from'] ?? '/';
        console.log(`previousUrl: ${this.previousUrl}`);
    }

    openLoginPage(provider: string) {
        window.location.href = `${environment.apiBaseUrl}/login?provider=${provider}&returnUrl=${this.previousUrl}`;
    }
}
