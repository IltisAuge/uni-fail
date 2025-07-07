import { Component } from '@angular/core';
import {Meta} from '@angular/platform-browser';
import {TitleService} from '../../services/title.service';

@Component({
    selector: 'app-about-us',
    standalone: true,
    imports: [],
    templateUrl: './about-us.component.html',
    styleUrl: './about-us.component.css',
})
export class AboutUsComponent {

    constructor(private titleService: TitleService,
                private metaService: Meta) {
        this.titleService.setTitle('Über uns');
        this.metaService.updateTag({
            name: 'description',
            content: 'Über die Macher von Unifail',
        });
        this.metaService.updateTag({
            name: 'keywords',
            content: 'Uni, Bewertung, Geschichten',
        });
        this.metaService.updateTag({
            property: 'og:title',
            content: 'Unifail - Über die Macher von Unifail',
        });
        this.metaService.updateTag({
            property: 'og:description',
            content: 'Über die Macher von Unifail',
        });
    }
}
