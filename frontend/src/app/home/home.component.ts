import { Component } from '@angular/core';
import {PostPreviewComponent} from '../post-preview/post-preview.component';
import {Title} from '@angular/platform-browser';
import {TitleService} from '../title.service';

@Component({
  selector: 'app-home',
  standalone: true,
    imports: [
        PostPreviewComponent
    ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
    constructor(private titleService: TitleService) {
        this.titleService.setTitle('Home');
    }
}
