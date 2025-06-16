import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from "../auth/auth.service";
import {FormsModule} from "@angular/forms";
import {environment} from "../../environments/environment";
import {filter} from 'rxjs';

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
        this.authService.getLoggedInUser().pipe(
            filter(state => state.success)
        ).subscribe(state => {
            this.isLoggedIn = !!state.user;
        });
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
