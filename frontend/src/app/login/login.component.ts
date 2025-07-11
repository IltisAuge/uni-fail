import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {environment} from '../../environments/environment';
import {TitleService} from '../../services/title.service';
import {NavigationService} from '../../services/navigation.service';

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

    constructor(private titleService: TitleService,
                private navigationService: NavigationService) {
        this.titleService.setTitle('Anmelden');
    }

    openLoginPage(provider: string) {
        const previousUrl =
                this.navigationService.hasPreviousUrl() ?
                    this.navigationService.getPreviousUrl() :
                    '';
        window.location.href = `${environment.apiBaseUrl}/login?provider=${provider}&returnUrl=${previousUrl}`;
    }
}
