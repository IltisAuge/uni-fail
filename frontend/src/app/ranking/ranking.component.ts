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

    @HostListener('window:resize', ['$event'])
    onResize(event: UIEvent) {
        this.rescalePodestals();
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
            if (!this.pedestalRefs || this.pedestalRefs.length === 0) return;

            // Set all element's width to "auto" und whitSpace "normal", to reapply text wrapping
            this.pedestalRefs.forEach(ref => {
                ref.nativeElement.style.width = 'auto';
                ref.nativeElement.style.whiteSpace = 'normal';
            });

            // Select width of the widest element (=maxWidth)
            let maxWidth = 0;
            this.pedestalRefs.forEach(ref => {
                const width = ref.nativeElement.offsetWidth;
                if (width > maxWidth) maxWidth = width;
            });

            // Set the same width for all elements
            this.pedestalRefs.forEach(ref => {
                ref.nativeElement.style.width = `${maxWidth}px`;
            });
        }, 50); // Delay for DOM-Stability
    }

}
