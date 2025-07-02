import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {isPlatformBrowser, NgClass, NgTemplateOutlet} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faArrowLeft, faCircleInfo} from '@fortawesome/free-solid-svg-icons';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';
import {NavigationComponent} from './navigation/navigation.component';

@Component({
    selector: 'app-root',
    imports: [NavigationComponent, RouterOutlet, FaIconComponent, RouterLink, NgTemplateOutlet, NgClass],
    templateUrl: './app.component.html',
    standalone: true,
    styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {

    protected readonly faCircleInfo = faCircleInfo;
    protected readonly faArrowLeft = faArrowLeft;

    theme: string = 'light';

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private http: HttpClient) {
    }

    ngOnInit() {
        this.http.get(`${environment.apiBaseUrl}/csrf-token`, {
            withCredentials: true,
        }).subscribe();
        if (isPlatformBrowser(this.platformId)) {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme) {
                this.theme = storedTheme;
            }
            document.documentElement.setAttribute('data-theme', this.theme);
        }
    }

    getThemeName() {
        return !this.theme ? '' : (this.theme === 'light' ? 'Hell' : 'Dunkel');
    }

    toggleTheme() {
        const nextTheme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', nextTheme);
        this.theme = nextTheme;
        document.documentElement.setAttribute('data-theme', nextTheme);
    }
}
