import {Component, OnInit} from '@angular/core';
import {HttpService} from './http.service';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {NgIf} from '@angular/common';
import {AuthService} from './auth/auth.service';
import {environment} from '../environments/environment';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-root',
	imports: [HomeComponent, LoginComponent, NgIf, HeaderComponent, RouterOutlet],
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
		httpService.get("/").subscribe(r => this.apiResponse = r);
		console.log("ENVIRONMENT: production=" + environment.production + " apiBaseUrl=" + environment.apiBaseUrl);
	}

	ngOnInit(): void {
		this.authService.checkLogin().subscribe(resp => {
			const user = resp.user;
			if (user != undefined) {
				this.user = user;
				console.log(user);
				this.username = "Logged in via " + user.provider + " as " + user.name + " (" + user.email + ")";
			}
		});
	}
}
