import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {environment} from '../../environments/environment';
import {TagComponent} from '../tag/tag.component';

export interface Post {
    _id: string;
    title: string;
    content: string;
    tags: string[];
    userId: string;
    userName: string;
    createdAt: string;
    upVotes: number;
    //downvote?: number;
}

@Component({
    selector: 'app-post-preview',
    standalone: true,
    imports: [CommonModule, RouterModule, TagComponent],
    templateUrl: './post-preview.component.html',
    styleUrl: './post-preview.component.css',
})
export class PostPreviewComponent {

    @Input() loading = true;
    @Input() posts: Post[] = [];

    /**
     * @return a shortened version of the post's content limited to 150 chars
     */
    getPreview(content: string): string {
        const maxLength = 150;
        return content.length > maxLength
            ? `${content.slice(0, maxLength)  }...`
            :content;
    }

    getFirstThreeTags(tags: string[]): string[] {
        return tags ? tags.slice(0, 3)
            .sort((a, b) => b.length - a.length) : [];
    }

    getPostImage(post: Post): string {
        return `${environment.apiBaseUrl}/user/${post.userId}/avatar`;
    }
}
