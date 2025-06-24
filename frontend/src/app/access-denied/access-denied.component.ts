import { Component } from '@angular/core';
import {TitleService} from '../title.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.css'
})
export class AccessDeniedComponent {
    constructor(private titleService: TitleService) {
        this.titleService.setTitle('Kein Zugriff');
    }
}
