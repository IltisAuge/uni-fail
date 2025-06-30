import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {filter, Subject, takeUntil} from 'rxjs';
import {TitleService} from '../../services/title.service';
import {PostPreviewComponent} from '../post-preview/post-preview.component';
import {environment} from '../../environments/environment';
import {AuthService} from '../../services/auth.service';
import {Post} from '../../interfaces/post.interface';

@Component({
    selector: 'app-user-posts',
    standalone: true,
    imports: [
        PostPreviewComponent,
    ],
    templateUrl: './user-posts.component.html',
    styleUrl: './user-posts.component.css',
})
export class UserPostsComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();
    posts: Post[] = [];
    loading: boolean = false;

    constructor(private titleService: TitleService,
                private http: HttpClient,
                private authService: AuthService) {
        this.titleService.setTitle('Deine Posts');
    }

    ngOnInit() {
        this.authService.getLoggedInUser().pipe(
            filter((state) => state.success),
            takeUntil(this.destroy$),
        ).subscribe((state) => {
            if (state.user) {
                this.loadPosts();
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
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
