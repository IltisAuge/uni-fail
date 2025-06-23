import { Component } from '@angular/core';
import {PostPreviewComponent} from '../post-preview/post-preview.component';

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

}
