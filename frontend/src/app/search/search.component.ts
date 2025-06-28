import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {TitleService} from '../services/title.service';
import {environment} from '../../environments/environment';
import {IPost} from '../post-preview/post-preview.component';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [
        NgForOf,
        NgIf,
        NgClass,
        RouterLink,
    ],
    templateUrl: './search.component.html',
    styleUrl: './search.component.css',
})
export class SearchComponent {

    posts: IPost[] = [];

    constructor(private titleService: TitleService,
                private http: HttpClient) {
        this.titleService.setTitle('Suche');
    }

    runSearch(search: string) {
        search = search.trim();
        if (search.length === 0) {
            return;
        }
        this.http.get<{items: IPost[]}>(`${environment.apiBaseUrl}/post/search?q=${search}`, {
            withCredentials: true,
        }).subscribe({
            next: (resp) => {
                this.posts = resp.items;
            },
            error: (error) => {
                console.log('An error occurred while searching:', error);
            },
        });
    }
}
