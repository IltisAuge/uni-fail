import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {TitleService} from '../services/title.service';

interface Post {
    title: string;
    content: string;
    tags: string[];
    userId: string;
}

@Component({
  selector: 'app-post-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-preview.component.html',
  styleUrl: './post-preview.component.css'
})
export class PostPreviewComponent implements OnInit {

    posts: Post[] = [];
    loading = true;
    error = '';

    constructor(private http: HttpClient) {
    }

    ngOnInit(): void {
        this.http.get<Post[]>(environment.apiBaseUrl + '/post/get?filter=newest') //Change the amount of post shown by '/post/get?filter=newest&max=numberofposts'
            .subscribe({
                next: (data) => {
                    this.posts = data;
                    this.loading = false;
                },
                error: (err) => {
                    this.error = 'Failed to load posts';
                    console.error('Error fetching posts:', err);
                    this.loading = false;
                }
            });
    }

    /** returns a shorted content of the post
     * length of 150 charcaters
     * Length of shortend content can be adjusted
     */
    getPreview(content: string): string {
        const maxLength = 150;

        return content.length > maxLength
            ? content.slice(0, maxLength) + '...'
            : content;
    }

    //to only show the first 3 tags
    getFirstThreeTags(tags: string[]): string[] {
        return tags ? tags.slice(0, 3)
            .map((tag) => tag.replace('uni:', ''))
            .sort((a, b) => b.length - a.length) : [];
    }

    getPostImage(post: Post): string {
        return environment.apiBaseUrl + '/user/' + post.userId + '/avatar';
    }
}
