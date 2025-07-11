import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-popup',
    template: `
        <div *ngIf="showPopup" class="popup">
            <div class="popup-content">
                <h2>Willkommen bei UniFail!</h2>
                <p>Dies ist dein erstes Mal hier 🎉</p>
                <button (click)="dismissPopup()">Nicht mehr anzeigen</button>
            </div>
        </div>
    `,
    standalone: true,
    styleUrls: ['./popup.component.css'],
    providers: [CookieService],
})
export class PopupComponent implements OnInit {
    showPopup = false;

    constructor(
        private cookieService: CookieService,
        private http: HttpClient
    ) {}

    ngOnInit() {
        this.showPopup = !this.cookieService.check('welcomePopupDismissed');
    }

    dismissPopup() {
        this.http.post('/api/dismiss-welcome', {}, { withCredentials: true }).subscribe(() => {
            this.cookieService.set('welcomePopupDismissed', 'true', 1000); //after 1000 days reevaluating
            this.showPopup = false;
        });
    }
}
