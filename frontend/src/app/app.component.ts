import {Component, OnInit} from '@angular/core';
import {HttpService} from './http.service';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {NgIf} from '@angular/common';
import {AuthService} from './auth/auth.service';
import {environment} from '../environments/environment';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet} from '@angular/router';
import {RouterLink, RouterLinkActive} from '@angular/router';



/*
import {SearchComponent} from './search/search.component';
import {RankingComponent} from './ranking/ranking.component';
import {PostFormComponent} from './post-form/post-form.component';
import {AboutUsComponent} from './about-us/about-us.component';
import {AboutUserComponent} from './about-user/about-user.component';
*/


@Component({
	selector: 'app-root',
	imports: [HomeComponent, LoginComponent, NgIf, HeaderComponent, RouterOutlet, RouterLink, RouterLinkActive /*SearchComponent, RankingComponent, PostFormComponent, AboutUsComponent, AboutUserComponent*/],
	templateUrl: './app.component.html',
	standalone: true,
	styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
	title = 'frontend';
	apiResponse: any = 'Requesting API response...';
	username: any = 'Not logged in';
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
		this.authService.checkLogin().subscribe(resp => {
			console.log(resp);
			if (!resp.success) {
				this.username = "Could not check authentication status! Make sure the API server is running correctly!";
				return;
			}
			const user = resp.user;
			if (user != undefined) {
				this.user = user;
				console.log(user);
				this.username = "Logged in via " + user.provider + " as " + user.name + " (" + user.email + ")";
			}
		});
	}
}
