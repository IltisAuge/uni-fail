import {Component} from '@angular/core';
import {faTriangleExclamation} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {TitleService} from '../services/title.service';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [
        FaIconComponent
    ],
    templateUrl: './not-found.component.html',
    styleUrl: './not-found.component.css'
})
export class NotFoundComponent {

    protected readonly faTriangleExclamation = faTriangleExclamation;

    constructor(titleService: TitleService) {
        titleService.setTitle('404');
    }
}
