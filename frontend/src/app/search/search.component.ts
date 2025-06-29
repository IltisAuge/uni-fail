import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {TitleService} from '../services/title.service';
import {environment} from '../../environments/environment';
import {Post, PostPreviewComponent} from '../post-preview/post-preview.component';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [
        NgForOf,
        NgIf,
        NgClass,
        RouterLink,
        PostPreviewComponent,
    ],
    templateUrl: './search.component.html',
    styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {

    posts: Post[] = [];
    loading = false;

    constructor(private titleService: TitleService,
                private http: HttpClient,
                private route: ActivatedRoute) {
        this.titleService.setTitle('Suche');
    }

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            const query = params['q'];
            if (query) {
                this.runSearch(query);
            }
        });
    }

    runSearch(search: string) {
        search = search.trim();
        if (search.length === 0) {
            return;
        }
        this.loading = true;
        this.http.get<{items: Post[]}>(`${environment.apiBaseUrl}/post/search?q=${search}`, {
            withCredentials: true,
        }).subscribe({
            next: (resp) => {
                this.posts = resp.items;
                this.loading = false;
            },
            error: (error) => {
                console.log('An error occurred while searching:', error);
            },
        });
    }
}
