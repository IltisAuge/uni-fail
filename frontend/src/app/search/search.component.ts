import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgClass, NgIf} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {Subject, takeUntil} from 'rxjs';
import {TitleService} from '../../services/title.service';
import {environment} from '../../environments/environment';
import {PostPreviewComponent} from '../post-preview/post-preview.component';
import {Post} from '../../interfaces/post.interface';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        PostPreviewComponent,
    ],
    templateUrl: './search.component.html',
    styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();
    posts: Post[] = [];
    loading = false;

    constructor(private titleService: TitleService,
                private http: HttpClient,
                private route: ActivatedRoute) {
        this.titleService.setTitle('Suche');
    }

    ngOnInit() {
        this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            const query = params['q'];
            if (query) {
                this.runSearch(query);
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
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
                console.error('An error occurred while searching for posts:', error);
            },
        });
    }
}
