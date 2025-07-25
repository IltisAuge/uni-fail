import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Meta} from '@angular/platform-browser';
import {PostPreviewComponent} from '../post-preview/post-preview.component';
import {TitleService} from '../../services/title.service';
import {environment} from '../../environments/environment';
import {Post} from '../../interfaces/post.interface';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        PostPreviewComponent,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {

    posts: Post[] = [];
    loading = false;

    constructor(private titleService: TitleService,
                private metaService: Meta,
                private http: HttpClient) {
        this.titleService.setTitle('Home');
        this.metaService.updateTag({
            name: 'description',
            content: 'Teile deine Geschichten auf Unifail',
        });
        this.metaService.updateTag({
            name: 'keywords',
            content: 'Uni, Bewertung, Geschichten',
        });
        this.metaService.updateTag({
            property: 'og:title',
            content: 'Unifail - Teile deine Geschichten',
        });
        this.metaService.updateTag({
            property: 'og:description',
            content: 'Teile deine Geschichten auf Unifail',
        });
    }

    ngOnInit() {
        this.http.get<Post[]>(`${environment.apiBaseUrl}/post/get?filter=newest&max=10`, {
            withCredentials: true,
        }).subscribe({
            next: (posts) => {
                this.posts = posts;
                this.loading = false;
            },
            error: (error) => {
                console.error('An error occurred while fetching posts for preview:', error);
                this.loading = false;
            },
        });
    }
}
