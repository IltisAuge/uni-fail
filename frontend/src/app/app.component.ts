import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {HttpService} from './http.service';
import {AuthService} from './auth/auth.service';
import {environment} from '../environments/environment';
import {NavigationComponent} from './navigation/navigation.component';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {isPlatformBrowser} from '@angular/common';
import {filter} from 'rxjs';

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
	user: any | undefined;
    theme: string = 'light';
    userId: string = '';
    displayName: string = '';

	constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private httpService: HttpService,
        private authService: AuthService,
        private router: Router) {
		console.log("ENVIRONMENT: production=" + environment.production + " apiBaseUrl=" + environment.apiBaseUrl);
	}

	ngOnInit(): void {
		this.httpService.get("/").subscribe(r => {
			if (!!r) {
				this.apiResponse = r;
			}
		});
        this.authService.getLoggedInUser().pipe(
            filter(state => state.success)
        ).subscribe(resp => {
            console.log("authService update in app.component");
			if (!resp || !resp.success) {
				this.username = "Could not check authentication status! Make sure the API server is running correctly!";
				return;
			}
			const user = resp.user;
			if (user) {
                this.user = user;
                this.isAdmin = user.isAdmin;
                this.userId = user._id;
                this.displayName = user.displayName;
                this.username = "Logged in via " + user.provider + " as " + user.name + " (" + user.email + ")";
                return;
            }
            this.username = "Not logged in";
            this.isAdmin = false;
		});
        if (isPlatformBrowser(this.platformId)) {
            let storedTheme = localStorage.getItem("theme");
            if (storedTheme) {
                this.theme = storedTheme;
            }
            document.documentElement.setAttribute('data-theme', this.theme);
        }
	}

    toggleTheme() {
        const nextTheme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', nextTheme);
        this.theme = nextTheme;
        document.documentElement.setAttribute('data-theme', nextTheme);
    }

    openMockUserPage() {
        this.router.navigate(['/user/' + this.userId]).then(r => {
            console.log(r);
        });
    }
}
