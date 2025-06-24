import {Component, ElementRef, Inject, OnInit, PLATFORM_ID, QueryList, ViewChildren} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {isPlatformBrowser, NgIf} from '@angular/common';
import {TitleService} from '../services/title.service';

@Component({
  selector: 'app-ranking',
  standalone: true,
    imports: [
        NgIf
    ],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.css'
})
export class RankingComponent implements OnInit {

    rankedUnis: any[] = [];
    @ViewChildren('itemRef') itemRefs!: QueryList<ElementRef<HTMLElement>>;

    constructor(@Inject(PLATFORM_ID) private platformId: Object,
                private http: HttpClient,
                private titleService: TitleService) {
        this.titleService.setTitle('Rangliste');
    }

    ngOnInit() {
        this.http.get(environment.apiBaseUrl + '/ranking/most-votes?limit=3', {observe: 'response'}).subscribe(res => {
            console.log(res);
            const body = res.body;
            if (body) {
                this.rankedUnis = body as any;
                this.rankedUnis.forEach(uni => {
                    uni._id = String(uni._id).replace('uni:', '');
                })
                console.log(this.rankedUnis);
                this.rescalePodestals();
            }
        });
    }

    rescalePodestals() {
        // Zeit lassen für Rendering
        setTimeout(() => {
            let maxWidth = 0;

            this.itemRefs.forEach(el => {
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

            this.itemRefs.forEach(el => {
                el.nativeElement.style.width = `${maxWidth}px`;
            });
        }, 100);
    }
}
