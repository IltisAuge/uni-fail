import {Component, OnInit} from '@angular/core';
import {HttpService} from './http.service';
import {AuthService} from './auth/auth.service';
import {environment} from '../environments/environment';
import {NavigationComponent} from './navigation/navigation.component';
import {RouterOutlet} from '@angular/router';

@Component({
	selector: 'app-root',
    imports: [NavigationComponent, RouterOutlet],
	templateUrl: './app.component.html',
	standalone: true,
	styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
	title = 'frontend';
	apiResponse: any = 'Requesting API response...';
	username: any = 'Not logged in';
	isAdmin: boolean = false;
	user: any | undefined

	constructor(private httpService: HttpService, private authService: AuthService) {
		console.log("ENVIRONMENT: production=" + environment.production + " apiBaseUrl=" + environment.apiBaseUrl);
	}

	ngOnInit(): void {
		this.httpService.get("/").subscribe(r => {
			if (!!r) {
				this.apiResponse = r;
			}
		});
		this.authService.getLoggedInUser().subscribe(resp => {
			if (!resp || !resp.success) {
				this.username = "Could not check authentication status! Make sure the API server is running correctly!";
				return;
			}
			const user = resp.user;
			if (user) {
                this.user = user;
                this.isAdmin = user.isAdmin;
                this.username = "Logged in via " + user.provider + " as " + user.name + " (" + user.email + ")";
                return;
            }
            this.username = "Not logged in";
            this.isAdmin = false;
		});
	}
}
