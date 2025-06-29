import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {filter} from 'rxjs';
import {environment} from '../../environments/environment';
import {Post} from '../post-preview/post-preview.component';
import {TagComponent} from '../tag/tag.component';
import {NotFoundComponent} from '../not-found/not-found.component';
import {AuthService} from '../services/auth.service';

@Component({
    selector: 'app-post',
    standalone: true,
    imports: [CommonModule, TagComponent, NotFoundComponent, RouterLink],
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit {

    isLoggedIn: boolean = false;
    post: Post | undefined;
    loading: boolean = true;
    error: string | undefined;

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        private router: Router,
        private authService: AuthService,
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            const postId = params.get('id');
            if (postId) {
                this.fetchPostDetails(postId);
            } else {
                this.error = 'Post-ID in der URL fehlt.';
                this.loading = false;
            }
        });
        this.authService.getLoggedInUser().pipe(
            filter((state) => state.success),
        ).subscribe((state) => {
            this.isLoggedIn = !!state.user;
        });
    }

    fetchPostDetails(id: string): void {
        this.loading = true;
        this.error = undefined;

        this.http.get<{post: Post}>(`${environment.apiBaseUrl}/post/${id}`, {
            withCredentials: true,
        }).subscribe({
            next: (resp) => {
                this.post = resp.post;
                this.loading = false;
                console.log('Post-Details erfolgreich abgerufen:', this.post);
            },
            error: (error) => {
                if (error.status !== 404) {
                    this.error = 'Fehler beim Laden des Posts. Bitte versuche es später erneut.';
                    console.error('An error occurred while loading post:', error);
                    this.loading = false;
                    return;
                }
                // Post not found
                this.loading = false;
                this.post = undefined;
                this.error = undefined;
            },
        });
    }

    getPostImage(post: Post): string {
        return `${environment.apiBaseUrl}/user/${post.userId}/avatar`;
    }

    deletePost(): void {
        // Call the backend to delete the post
        if (!this.post || !this.post._id) {
            console.error('Kein Post oder keine gültige ID zum Löschen verfügbar.');
            alert('Error.');
            return;
        }

        if (confirm('Bist du sicher, dass du diesen Post endgültig löschen möchtest?')) {
            this.http.delete(`${environment.apiBaseUrl}/post/delete/${this.post._id}`, {
                withCredentials: true,
            }).subscribe({
                next: async (response) => {
                    console.log('Post erfolgreich gelöscht:', response);
                    alert('Post deleted');
                    await this.router.navigate(['/']);
                },
                error: (err) => {
                    console.error('Fehler beim Löschen des Posts:', err);
                    alert('Error deleting');
                    this.error = 'Deleting did not work';
                },
            });
        }
    }

    //return button
    async goBack() {
        await this.router.navigate(['/']);
    }

    addUpVote() {
        if (!this.post) {
            return;
        }
        const token = document.cookie.split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];

        const headers = new HttpHeaders({
            'X-XSRF-TOKEN': token ?? '',
        });
        this.http.post<{post: Post}>(`${environment.apiBaseUrl}/vote/add`, {
            postId: this.post._id,
        }, {
            headers,
            withCredentials: true,
        }).subscribe({
            next: (resp) => {
                this.post = resp.post;
            },
            error: (error) => {
                console.error('An error occurred while adding up-vote to post:', error);
            },
        });
    }

    async routeToLogin() {
        await this.router.navigate(['/login'], {
            state: { from: this.router.url },
        });
    }
}
