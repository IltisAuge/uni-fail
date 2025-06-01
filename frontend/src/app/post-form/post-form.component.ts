import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../auth/auth.service';
import {environment} from '../../environments/environment';

@Component({
	selector: 'app-post-form',
	standalone: true,
	imports: [
		ReactiveFormsModule, CommonModule
	],
	templateUrl: './post-form.component.html',
	styleUrl: './post-form.component.css'
})
export class PostFormComponent {
	postForm: FormGroup;
	isLoggedIn: boolean = false;

	constructor(
		private fb: FormBuilder,
		private authService: AuthService
	) {
		this.postForm = this.fb.group({
			content: ['', Validators.required],
			tags: ['']
		});

		this.authService.isLoggedIn().subscribe(isLoggedIn => {
			this.isLoggedIn = isLoggedIn;
		});
	}

	onSubmit() {
		if (this.postForm.valid) {
			fetch(environment.apiBaseUrl + '/post/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(this.postForm.value)
			}).then(result => {
				console.log(result);
			});
		}
	}
}
