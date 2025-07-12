import { Component, EventEmitter, OnInit, Output, Inject, PLATFORM_ID } from '@angular/core'; // <-- Add Inject, PLATFORM_ID
import { CookieService } from 'ngx-cookie-service';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // <-- Add isPlatformBrowser
import confetti from 'canvas-confetti';

@Component({
    selector: 'app-popup',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pop-up.component.html',
    styleUrls: ['./pop-up.component.css'],
    providers: [CookieService],
})
export class PopupComponent implements OnInit {
    showPopup = true;

    @Output() closed = new EventEmitter<boolean>();

    constructor(
        private cookieService: CookieService,
        @Inject(PLATFORM_ID) private platformId: Object,
    ) {}

    ngOnInit() {
        this.showPopup = !this.cookieService.check('welcomePopupDismissed');
        console.log('OnInit - showWelcomePopup:', this.showPopup);

        // Guard the confetti call with the platform check
        if (isPlatformBrowser(this.platformId) && this.showPopup) {
            this.shootConfetti();
        }
    }

    dismissPopup() {
        this.cookieService.set('welcomePopupDismissed', 'true', {
            path: '/',
            sameSite: 'Lax',
            expires: 7,
        });
        this.showPopup = false;
        this.closed.emit(true);
    }

    closePopup() {
        this.showPopup = false; //local
        this.closed.emit(false);
    }
    shootConfetti(): void {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.8, y: 0.7 },
            colors: ['#bb0000', '#ffffff', '#00ff00', '#0000bb'],
            shapes: ['square', 'circle'],
            scalar: 1.1,
        });
    }
}
