import {Component, ElementRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {TitleService} from '../services/title.service';
import {Post} from '../post-preview/post-preview.component';

interface ITag {
    name: string;
    displayName: string;
}

@Component({
    selector: 'app-post-form',
    standalone: true,
    imports: [
        ReactiveFormsModule, CommonModule,
    ],
    templateUrl: './post-form.component.html',
    styleUrl: './post-form.component.css',
})
export class PostFormComponent {

    @ViewChild('tagsDialog') tagsDialogRef!: ElementRef<HTMLDialogElement>;
    postForm: FormGroup;
    isModalOpen: boolean = false;
    tags: ITag[] = [];
    displayedTags: ITag[] = [];
    selectedTags: ITag[] = [];

    constructor(
		private fb: FormBuilder,
        private http: HttpClient,
        private titleSerivce: TitleService,
        private router: Router,
    ) {
        this.titleSerivce.setTitle('Post erstellen');

        this.postForm = this.fb.group({
            content: ['', Validators.required],
            title: ['', Validators.required],
        });

        this.http.get<{tags: string[]}>(`${environment.apiBaseUrl}/tag/get/all`, {
            withCredentials: true,
        }).subscribe({
            next: (resp) => {
                this.tags = resp.tags.map((tag) => (
                    {
                        name: tag,
                        displayName: tag.replace('uni:', ''),
                    }
                ));
            },
            error: (error) => {
                console.error('An error occurred while fetching tags:', error);
            },
        });
    }

    createPost() {
        if (this.postForm.valid) {
            const payload = {
                ...this.postForm.value,
                tags: this.selectedTags.map((tag) => tag.name),
            };
            this.http.post<{post: Post}>(`${environment.apiBaseUrl}/post/create`, payload,
                {
                    withCredentials: true,
                }).subscribe({
                next: async (resp) => {
                    // Redirect to post view
                    await this.router.navigate([`/post/${resp.post._id}`]);
                },
                error: (error) => {
                    console.error('An error occurred while creating post:', error);
                },
            });
        }
    }

    openTagsModal() {
        this.tagsDialogRef.nativeElement.showModal();
        this.isModalOpen = true;
        this.filterTags('');
    }

    closeTagsModal() {
        this.tagsDialogRef.nativeElement.close();
        this.isModalOpen = false;
    }

    filterTags(filter: string) {
        filter = filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let filtered: ITag[];
        if (filter.length === 0) {
            const uniTags = this.tags.filter((tag) => tag.name.startsWith('uni:') && !this.selectedTags.includes(tag));
            const hashTags = this.tags.filter((tag) => tag.name.startsWith('#') && !this.selectedTags.includes(tag));
            const shuffledUni = uniTags.sort(() => 0.5 - Math.random());
            const shuffledHash = hashTags.sort(() => 0.5 - Math.random());
            // Add 15 #tags, 5 "uni:" tags
            const additionalTags = [
                ...shuffledHash.slice(0, 15),
                ...shuffledUni.slice(0, 5),
            ];
            filtered = [...this.selectedTags, ...additionalTags.sort(() => 0.5 - Math.random())];
        } else {
            filtered = this.tags
                .filter((tag) => tag.name.match(new RegExp(filter, 'i')));
        }
        this.displayedTags = filtered;
    }

    toggleTagSelection(tag: ITag) {
        if (this.selectedTags.includes(tag)) {
            this.selectedTags.splice(this.selectedTags.indexOf(tag), 1);
            return;
        }
        this.selectedTags.push(tag);
    }
}
