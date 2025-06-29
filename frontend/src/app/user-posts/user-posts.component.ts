import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {filter} from 'rxjs';
import {TitleService} from '../services/title.service';
import {Post, PostPreviewComponent} from '../post-preview/post-preview.component';
import {environment} from '../../environments/environment';
import {AuthService} from '../services/auth.service';

@Component({
    selector: 'app-user-posts',
    standalone: true,
    imports: [
        PostPreviewComponent,
    ],
    templateUrl: './user-posts.component.html',
    styleUrl: './user-posts.component.css',
})
export class UserPostsComponent implements OnInit {

    posts: Post[] = [];
    loading: boolean = false;

    constructor(private titleService: TitleService,
                private http: HttpClient,
                private authService: AuthService) {
        titleService.setTitle('Deine Posts');
    }

    ngOnInit() {
        this.authService.getLoggedInUser().pipe(
            filter((state) => state.success),
        ).subscribe((state) => {
            if (state.user) {
                this.loadPosts();
            }
        });
    }

    loadPosts() {
        this.loading = true;
        this.http.get<Post[]>(`${environment.apiBaseUrl}/post/get/?filter=user&max=10`, {
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
