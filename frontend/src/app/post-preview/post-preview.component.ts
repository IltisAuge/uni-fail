import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {environment} from '../../environments/environment';
import {TagComponent} from '../tag/tag.component';
import {Post} from '../../interfaces/post.interface';

@Component({
    selector: 'app-post-preview',
    standalone: true,
    imports: [CommonModule, RouterModule, TagComponent],
    templateUrl: './post-preview.component.html',
    styleUrl: './post-preview.component.css',
})
export class PostPreviewComponent implements OnChanges {

    @Input() loading = true;
    @Input() posts: Post[] = [];

    constructor(private router: Router) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['posts'] && this.posts?.length > 0) {
            this.posts.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        }
    }

    /**
     * @return a shortened version of the post's content limited to 150 chars
     */
    getPreview(content: string): string {
        const maxLength = 150;
        return content.length > maxLength
            ? `${content.slice(0, maxLength)}...`
            :content;
    }

    getFirstThreeTags(tags: string[]): string[] {
        return tags ? tags.slice(0, 3)
            .sort((a, b) => b.length - a.length) : [];
    }

    getPostImage(post: Post): string {
        return `${environment.apiBaseUrl}/user/${post.userId}/avatar?ts=${Date.now()}`;
    }

    async goToPost(post: Post) {
        await this.router.navigate(['/post', post._id]);
    }

    async onPostKeydown(event: KeyboardEvent, post: Post) {
        if (event.key === 'Enter') {
            event.preventDefault();
            await this.goToPost(post);
        }
    }
}
