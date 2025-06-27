import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {RouterModule} from '@angular/router';

export interface IPost {
    _id: string;
    title: string;
    content: string;
    tags: string[];
    userId: string;
    createdAt?: Date;
    author?: string;
    // for the evaluation, yet to be implemented
    //upvotes?: number;
    //downvote?: number;
}

@Component({
    selector: 'app-post-preview',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './post-preview.component.html',
    styleUrl: './post-preview.component.css'
})
export class PostPreviewComponent implements OnInit {

    posts: IPost[] = [];
    loading = true;
    error = '';

    constructor(private http: HttpClient) {
    }

    ngOnInit(): void {
        this.http.get<IPost[]>(`${environment.apiBaseUrl}/post/get?filter=newest&max=10`
        ).subscribe({
            next: (posts) => {
                this.posts = posts;
                this.loading = false;
            },
            error: (error) => {
                this.error = 'Failed to load posts';
                console.error('An error occurred while fetching posts for preview:', error);
                this.loading = false;
            }
        });
    }

    /**
     * @return a shortened version of the post's content limited to 150 chars
     */
    getPreview(content: string): string {
        const maxLength = 150;
        return content.length > maxLength
            ? content.slice(0, maxLength) + '...'
            :content;
    }

    getFirstThreeTags(tags: string[]): string[] {
        return tags ? tags.slice(0, 3)
            .map((tag) => tag.replace('uni:', ''))
            .sort((a, b) => b.length - a.length):[];
    }

    getPostImage(post: IPost): string {
        return `${environment.apiBaseUrl}/user/${post.userId}/avatar`;
    }
}
