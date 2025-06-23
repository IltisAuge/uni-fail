import {Component, ElementRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../auth/auth.service';
import {environment} from '../../environments/environment';
import {filter} from 'rxjs';
import {HttpClient} from '@angular/common/http';

interface Tag {
    name: string;
    displayName: string;
}

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
    @ViewChild('tagsDialog') tagsDialogRef!: ElementRef<HTMLDialogElement>;
    isModalOpen: boolean = false;
    tags: Tag[] = [];
    displayedTags: Tag[] = [];
    selectedTags: Tag[] = [];

	constructor(
		private fb: FormBuilder,
        private http: HttpClient,
		private authService: AuthService
	) {
		this.postForm = this.fb.group({
			content: ['', Validators.required],
            title: ['', Validators.required]
        });

        this.authService.getLoggedInUser().pipe(
            filter(state => state.success)
        ).subscribe(state => {
			this.isLoggedIn = !!state.user;
		});

        this.http.get<{tags: string[]}>(environment.apiBaseUrl + '/tag/get/all',
            { observe: 'response' }
        ).subscribe(resp => {
            console.log("received tags:", resp.body?.tags);
            if (resp.status === 200 && resp.body) {
                this.tags = resp.body.tags
                    .map((tag) =>
                        ({name: tag, displayName: tag.replace('uni:', '')}));
            }
        });
	}

	onSubmit() {
		if (this.postForm.valid) {
            const payload = {
                ...this.postForm.value,
                tags: this.selectedTags.map(t => t.name)
            };
			this.http.post(environment.apiBaseUrl + '/post/create',
                payload,
                { observe: 'response' }
            ).subscribe(resp => {
                if (resp.status === 200) {
                    // Redirect to post view
                }
            });
		}
	}

    openModal() {
        this.tagsDialogRef.nativeElement.showModal();
        this.isModalOpen = true;
        this.filterTags('');
    }

    closeModal() {
        this.tagsDialogRef.nativeElement.close();
        this.isModalOpen = false;
    }

    filterTags(filter: string) {
        filter = filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let filtered: Tag[];
        if (filter.length === 0) {
            const uniTags = this.tags.filter(tag => tag.name.startsWith('uni:') && !this.selectedTags.includes(tag));
            const hashTags = this.tags.filter(tag => tag.name.startsWith('#') && !this.selectedTags.includes(tag));
            const shuffledUni = uniTags.sort(() => 0.5 - Math.random());
            const shuffledHash = hashTags.sort(() => 0.5 - Math.random());
            // Add 15 #tags, 5 "uni:" tags
            const additionalTags = [
                ...shuffledHash.slice(0, 15),
                ...shuffledUni.slice(0, 5)
            ];
            console.log("additional tags:", additionalTags);
            filtered = [...this.selectedTags, ...additionalTags.sort(() => 0.5 - Math.random())];
        } else {
            filtered = this.tags
                .filter((tag) => tag.name.match(new RegExp(filter, 'i')));
        }
        this.displayedTags = filtered;
    }

    toggleTagSelection(tag: Tag) {
        if (this.selectedTags.includes(tag)) {
            this.selectedTags.splice(this.selectedTags.indexOf(tag), 1);
        } else {
            this.selectedTags.push(tag);
        }
    }
}
