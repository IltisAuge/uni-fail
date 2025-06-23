import { Component } from '@angular/core';
import {faExclamation, faTriangleExclamation} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';

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

    protected readonly faExclamation = faExclamation;
    protected readonly faTriangleExclamation = faTriangleExclamation;
}
