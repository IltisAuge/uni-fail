import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../auth/auth.service';
//some kind of service that handles http requests to the backend


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
		//private postService: PostService,
		private authService: AuthService
	) {
		this.postForm = this.fb.group({
			content: ['', Validators.required],
			tags: ['']
		});

		//check authentifiaction
		this.authService.isLoggedIn().subscribe(isLoggedIn => {
			this.isLoggedIn = isLoggedIn;
		})
	}

	onSubmit() {
		if (this.postForm.valid) {
			console.log('Form submitted', this.postForm.value);
			alert('Form submitted! Check console for data.');
			this.postForm.reset();
		}
	}
}
