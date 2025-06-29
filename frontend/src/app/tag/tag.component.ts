import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-tag',
    standalone: true,
    imports: [],
    templateUrl: './tag.component.html',
    styleUrl: './tag.component.css',
})
export class TagComponent implements OnInit {

    @Input() tag: string = '';

    ngOnInit() {
        this.tag = this.tag.replace('uni:', '');
    }
}
