import { Component } from '@angular/core';
import {TitleService} from '../services/title.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
    constructor(private titleService: TitleService) {
        this.titleService.setTitle('Suche');
    }
}
