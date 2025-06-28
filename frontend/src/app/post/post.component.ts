import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import { HttpClient } from '@angular/common/http'; // we use HTTP CLient directly
import { environment } from '../../environments/environment';
import { IPost } from '../post-preview/post-preview.component';

@Component({
    selector: 'app-post',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit {

    post: IPost | undefined;
    loading: boolean = true;
    error: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,// injection
        private router: Router,
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
    }

    fetchPostDetails(id: string): void {
        this.loading = true;
        this.error = null;


        //get Backend end point
        this.http.get<IPost>(`${environment.apiBaseUrl}/post/${id}`, {withCredentials:true}).subscribe({
            next: (data) => {
                this.post = data;
                this.loading = false;
                console.log('Post-Details erfolgreich abgerufen:', this.post);
            },
            error: (err) => {
                this.error = 'Fehler beim Laden des Posts. Bitte versuche es später erneut.';
                this.loading = false;
                console.error('Fehler beim Abrufen der Post-Details:', err);
            },
        });
    }

    getPostImage(post: IPost): string {
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
            this.http.delete(`${environment.apiBaseUrl}/post/delete/${this.post._id}`, {withCredentials: true })
                .subscribe({ // Direkt HttpClient.delete nutzen
                    next: (response) => {
                        console.log('Post erfolgreich gelöscht:', response);
                        alert('Post deleted');
                        this.router.navigateByUrl('/home');
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
    goBack(): void {
        this.router.navigate(['/']);
    }
}
