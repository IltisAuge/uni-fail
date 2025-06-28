import {Component, ElementRef, Inject, OnInit, PLATFORM_ID, QueryList, ViewChildren} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {isPlatformBrowser, NgIf} from '@angular/common';
import {environment} from '../../environments/environment';
import {TitleService} from '../services/title.service';

@Component({
    selector: 'app-ranking',
    standalone: true,
    imports: [
        NgIf,
    ],
    templateUrl: './ranking.component.html',
    styleUrl: './ranking.component.css',
})
export class RankingComponent implements OnInit {

    rankedUnis: {_id: string, totalUpvotes: number}[] = [];
    @ViewChildren('itemRef') itemRefs!: QueryList<ElementRef<HTMLElement>>;

    constructor(@Inject(PLATFORM_ID) private platformId: Object,
                private http: HttpClient,
                private titleService: TitleService) {
        this.titleService.setTitle('Rangliste');
    }

    ngOnInit() {
        this.http.get<{_id: string, totalUpvotes: number}[]>(
            `${environment.apiBaseUrl}/ranking/most-votes?limit=3`,
        ).subscribe({
            next: (resp) => {
                this.rankedUnis = resp;
                this.rankedUnis.forEach((uni) => {
                    uni._id = String(uni._id).replace('uni:', '');
                });
                this.rescalePodestals();
            },
            error: (error) => {
                console.log('An error occurred while fetching ranking most votes:', error);
            },
        });
    }

    rescalePodestals() {
        setTimeout(() => {
            let maxWidth = 0;

            this.itemRefs.forEach((el) => {
                const width = el.nativeElement.scrollWidth;
                console.log(width);
                if (width > maxWidth) {
                    maxWidth = width;
                }
            });

            let fontSize;
            if (isPlatformBrowser(this.platformId)) {
                fontSize = getComputedStyle(document.documentElement).fontSize;
            } else {
                fontSize = '16';
            }
            const minWidth = 5 * parseFloat(fontSize);
            maxWidth = Math.max(maxWidth, minWidth);

            this.itemRefs.forEach((el) => {
                el.nativeElement.style.width = `${maxWidth}px`;
            });
        }, 100);
    }
}
