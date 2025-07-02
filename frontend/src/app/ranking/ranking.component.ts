import {Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
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

    constructor(private http: HttpClient,
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
            },
            error: (error) => {
                console.log('An error occurred while fetching ranking most votes:', error);
            },
        });
    }
}
