import {Component, ElementRef, Inject, OnInit, PLATFORM_ID, QueryList, ViewChildren} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {isPlatformBrowser, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {Meta} from '@angular/platform-browser';
import confetti from 'canvas-confetti';
import {environment} from '../../environments/environment';
import {TitleService} from '../../services/title.service';

@Component({
    selector: 'app-ranking',
    standalone: true,
    imports: [
        NgIf,
        RouterLink,
    ],
    templateUrl: './ranking.component.html',
    styleUrl: './ranking.component.css',
})
export class RankingComponent implements OnInit {

    rankedUnis: {_id: string, totalUpvotes: number}[] = [];
    @ViewChildren('pedestalRef') pedestalRefs!: QueryList<ElementRef<HTMLElement>>;

    constructor(@Inject(PLATFORM_ID) private platformId: Object,
                private http: HttpClient,
                private metaService: Meta,
                private titleService: TitleService) {
        this.titleService.setTitle('Rangliste');
        this.metaService.updateTag({
            name: 'description',
            content: 'Rangliste von Unifail',
        });
        this.metaService.updateTag({
            name: 'keywords',
            content: 'Uni, Bewertung, Geschichten',
        });
        this.metaService.updateTag({
            property: 'og:title',
            content: 'Unifail - Rangliste',
        });
        this.metaService.updateTag({
            property: 'og:description',
            content: 'Die Unis und Hochschulen mit den meisten Votes',
        });
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
                if (isPlatformBrowser(this.platformId)) {
                    this.shootConfetti();
                }
            },
            error: (error) => {
                console.error('An error occurred while fetching ranking most votes:', error);
            },
        });
    }

    shootConfetti(): void {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#bb0000', '#ffffff', '#00ff00', '#0000bb'],
            shapes: ['square', 'circle'],
            scalar: 1.2,
        });
        setTimeout(() => {
            confetti({
                particleCount: 80,
                spread: 80,
                origin: { x: 0.8, y: 0.7 }, //start right
                colors: ['#FFA500', '#FFD700', '#FF4500'],
                scalar: 1,
            });
        }, 250);
    }
}


