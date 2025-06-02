import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from "../auth/auth.service";
import {HttpService} from "../http.service";
import {FormsModule} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Component({
    selector: 'app-navigation',
    standalone: true,
	imports: [
		CommonModule,
		RouterLink,
		RouterLinkActive,
		FormsModule
	],
    templateUrl: './navigation.component.html',
    styleUrl: './navigation.component.css'
})
export class NavigationComponent implements OnInit {

	isLoggedIn: boolean = false;

	constructor(private authService: AuthService) {
	}

	ngOnInit(): void {
		this.authService.isLoggedIn().subscribe(isLoggedIn => {
			this.isLoggedIn = isLoggedIn;
		})
	}

	logout() {
		fetch(environment.apiBaseUrl + '/logout', {
			method: 'POST',
			credentials: 'include'
		}).then(result => {
			if (result.status === 200) {
				this.authService.resetUser();
			}
		});
	}
}
