import {Component} from '@angular/core';
import {TitleService} from '../services/title.service';

@Component({
    selector: 'app-user-posts',
    standalone: true,
    imports: [],
    templateUrl: './user-posts.component.html',
    styleUrl: './user-posts.component.css'
})
export class UserPostsComponent {
    constructor(titleService: TitleService) {
        titleService.setTitle('Deine Posts');
    }
}
