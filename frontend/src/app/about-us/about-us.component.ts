import { Component } from '@angular/core';
import {TitleService} from '../../services/title.service';

@Component({
    selector: 'app-about-us',
    standalone: true,
    imports: [],
    templateUrl: './about-us.component.html',
    styleUrl: './about-us.component.css',
})
export class AboutUsComponent {
    constructor(private titleService: TitleService) {
        this.titleService.setTitle('Über uns');
    }
}
